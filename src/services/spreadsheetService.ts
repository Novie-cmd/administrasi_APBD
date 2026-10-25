import { Program, Kegiatan, SubKegiatan, Belanja, Anggaran, Realisasi, User } from '../types';
import { cleanBudgetCode, cleanDateValue, extractCode } from '../utils/codeUtils';

interface GVizColumn {
  id: string;
  label: string;
  type: string;
}

interface GVizCell {
  v: any;
  f?: string;
}

interface GVizRow {
  c: (GVizCell | null)[];
}

interface GVizResponse {
  table: {
    cols: GVizColumn[];
    rows: GVizRow[];
  };
}

export interface ExtractedSpreadsheetData {
  success: boolean;
  message: string;
  programs: Program[];
  kegiatanList: Kegiatan[];
  subKegiatanList: SubKegiatan[];
  belanjaList: Belanja[];
  anggaranList: Anggaran[];
  realisasiList: Realisasi[];
  users?: User[];
}

/**
 * Fetch a specific sheet via Google Visualization API with CORS and JSON parsing.
 */
async function fetchSheetGViz(spreadsheetId: string, sheetName: string): Promise<Record<string, any>[] | null> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start === -1 || end === -1) return null;
    const data: GVizResponse = JSON.parse(text.substring(start, end));

    if (!data.table || !Array.isArray(data.table.rows)) return null;

    const cols = data.table.cols.map(c => (c.label || '').trim());
    return data.table.rows.map(r => {
      const rowObj: Record<string, any> = {};
      r.c?.forEach((cell, idx) => {
        const colName = cols[idx] || `col_${idx}`;
        rowObj[colName] = cell ? cell.v : null;
      });
      return rowObj;
    });
  } catch (err) {
    console.warn(`[GViz] Failed to fetch sheet "${sheetName}":`, err);
    return null;
  }
}

/**
 * Fetch full, verified data from Google Spreadsheet across all 5 sheets.
 */
export async function fetchCompleteSpreadsheetData(
  spreadsheetId: string,
  webAppUrl?: string
): Promise<ExtractedSpreadsheetData> {
  const cleanId = (spreadsheetId || '1q-ZorXYniIzVy2h6b-WJVGvGanqqn6SBNlhu_upN-DY').trim();

  // 1. Fetch all sheets in parallel via Google Visualization API
  const [progRows, kegRows, subRows, paguRows, realRows] = await Promise.all([
    fetchSheetGViz(cleanId, 'Program').then(r => r || fetchSheetGViz(cleanId, 'Master_Program')),
    fetchSheetGViz(cleanId, 'Kegiatan').then(r => r || fetchSheetGViz(cleanId, 'Master_Kegiatan')),
    fetchSheetGViz(cleanId, 'Sub_Kegiatan').then(r => r || fetchSheetGViz(cleanId, 'Master_Sub_Kegiatan')),
    fetchSheetGViz(cleanId, 'Pagu_Anggaran').then(r => r || fetchSheetGViz(cleanId, 'Anggaran')),
    fetchSheetGViz(cleanId, 'Realisasi_SP2D').then(r => r || fetchSheetGViz(cleanId, 'Realisasi'))
  ]);

  // If GViz failed on primary transaction sheets, attempt WebApp fallback
  if ((!realRows || realRows.length === 0) && (!paguRows || paguRows.length === 0) && webAppUrl) {
    return await fetchViaWebAppFallback(cleanId, webAppUrl);
  }

  // Master Data collections
  const programMap = new Map<string, Program>();
  const kegiatanMap = new Map<string, Kegiatan>();
  const subKegiatanMap = new Map<string, SubKegiatan>();
  const belanjaMap = new Map<string, Belanja>();

  // 1. Process Program
  if (progRows && progRows.length > 0) {
    progRows.forEach(row => {
      const rawCode = row['Kode_Program'] || row['kodeProgram'] || row['Kode Program'];
      const kodeProg = cleanBudgetCode(rawCode);
      const namaProg = String(row['Nama_Program'] || row['namaProgram'] || row['Nama Program'] || '').trim();
      const tahun = Number(row['Tahun'] || row['tahun']) || 2025;
      if (kodeProg && namaProg) {
        programMap.set(`${kodeProg}_${tahun}`, { kodeProgram: kodeProg, namaProgram: namaProg, tahun });
      }
    });
  }

  // 2. Process Kegiatan
  if (kegRows && kegRows.length > 0) {
    kegRows.forEach(row => {
      const rawProg = row['Kode_Program'] || row['kodeProgram'];
      const rawKeg = row['Kode_Kegiatan'] || row['kodeKegiatan'];
      const kodeProg = cleanBudgetCode(rawProg);
      const kodeKeg = cleanBudgetCode(rawKeg);
      const namaKeg = String(row['Nama_Kegiatan'] || row['namaKegiatan'] || '').trim();
      const tahun = Number(row['Tahun'] || row['tahun']) || 2025;
      if (kodeKeg && namaKeg) {
        const resolvedProg = kodeProg || kodeKeg.split('.').slice(0, 3).join('.');
        kegiatanMap.set(`${kodeKeg}_${tahun}`, {
          kodeProgram: resolvedProg,
          kodeKegiatan: kodeKeg,
          namaKegiatan: namaKeg,
          tahun
        });
      }
    });
  }

  // 3. Process Sub Kegiatan
  if (subRows && subRows.length > 0) {
    subRows.forEach(row => {
      const rawProg = row['Kode_Program'] || row['kodeProgram'];
      const rawKeg = row['Kode_Kegiatan'] || row['kodeKegiatan'];
      const rawSub = row['Kode_Sub_Kegiatan'] || row['Kode_Sub'] || row['kodeSub'];
      const kodeProg = cleanBudgetCode(rawProg);
      const kodeKeg = cleanBudgetCode(rawKeg);
      const kodeSub = cleanBudgetCode(rawSub);
      const namaSub = String(row['Nama_Sub_Kegiatan'] || row['Nama_Sub'] || row['namaSub'] || '').trim();
      const tahun = Number(row['Tahun'] || row['tahun']) || 2025;
      if (kodeSub && namaSub) {
        const resolvedProg = kodeProg || (kodeSub.includes('.') ? kodeSub.split('.').slice(0, 3).join('.') : '8.01.01');
        const resolvedKeg = kodeKeg || (kodeSub.includes('.') ? kodeSub.split('.').slice(0, 5).join('.') : '8.01.01.1.01');
        subKegiatanMap.set(`${kodeSub}_${tahun}`, {
          kodeProgram: resolvedProg,
          kodeKegiatan: resolvedKeg,
          kodeSub,
          namaSub,
          tahun
        });
      }
    });
  }

  // 4. Process Pagu Anggaran
  const parsedAnggaran: Anggaran[] = [];
  if (paguRows && paguRows.length > 0) {
    paguRows.forEach((row, idx) => {
      const rawSub = row['Kode_Sub_Kegiatan'] || row['Kode_Sub'] || row['kodeSub'];
      const rawBel = row['Kode_Rekening_Belanja'] || row['Kode_Belanja'] || row['kodeBelanja'];
      const kodeSub = cleanBudgetCode(rawSub);
      const kodeBelanja = extractCode(rawBel);
      if (!kodeSub || !kodeBelanja) return;

      const tahun = Number(row['Tahun'] || row['tahun']) || 2025;
      const namaSub = String(row['Nama_Sub_Kegiatan'] || row['Nama_Sub'] || row['namaSub'] || '').trim();
      const namaBelanja = String(row['Nama_Rekening_Belanja'] || row['Nama_Belanja'] || row['namaBelanja'] || '').trim();

      const paguMurni = Number(row['Pagu_Murni_Rp'] || row['Pagu_Murni'] || row['nilaiMurni'] || row['pagu']) || 0;
      const revisi = Number(row['Pagu_Perubahan_Rp'] || row['Pagu_Perubahan'] || row['nilaiPerubahan'] || row['revisi']) || 0;
      const paguAkhir = Number(row['Nilai_Pagu_Efektif_Rp'] || row['Pagu_Akhir'] || row['nilai'] || row['paguAkhir']) || (paguMurni + revisi);

      let sumberDana = String(row['Sumber_Dana'] || row['sumberDana'] || '').trim();
      if (!sumberDana || !isNaN(Number(sumberDana))) {
        sumberDana = 'PAD';
      }

      const kdProg = cleanBudgetCode(row['Kode_Program'] || (kodeSub.includes('.') ? kodeSub.split('.').slice(0, 3).join('.') : '8.01.01'));
      const kdKeg = cleanBudgetCode(row['Kode_Kegiatan'] || (kodeSub.includes('.') ? kodeSub.split('.').slice(0, 5).join('.') : '8.01.01.1.01'));

      // Auto-register sub kegiatan if not in master
      if (kodeSub && !subKegiatanMap.has(`${kodeSub}_${tahun}`)) {
        subKegiatanMap.set(`${kodeSub}_${tahun}`, {
          kodeProgram: kdProg,
          kodeKegiatan: kdKeg,
          kodeSub,
          namaSub: namaSub || `Sub Kegiatan ${kodeSub}`,
          tahun
        });
      }

      // Auto-register rekening belanja if not in master
      if (kodeBelanja && !belanjaMap.has(`${kodeBelanja}_${tahun}`)) {
        belanjaMap.set(`${kodeBelanja}_${tahun}`, {
          kodeBelanja,
          namaBelanja: namaBelanja || `Belanja Rekening ${kodeBelanja}`,
          jenisBelanja: 'Belanja Barang dan Jasa',
          tahun
        });
      }

      const stableId = String(row['ID'] || row['id'] || `ANG-${tahun}-${kodeBelanja.replace(/\./g, '')}-${kodeSub.replace(/\./g, '')}-${idx}`);

      parsedAnggaran.push({
        id: stableId,
        tahun,
        kodeProgram: kdProg,
        kodeKegiatan: kdKeg,
        kodeSub,
        kodeBelanja,
        namaBelanja: namaBelanja || belanjaMap.get(`${kodeBelanja}_${tahun}`)?.namaBelanja || `Belanja ${kodeBelanja}`,
        pagu: paguMurni,
        revisi,
        nilaiSPD: paguAkhir,
        paguAkhir,
        tanggalInput: new Date().toISOString().split('T')[0],
        operator: 'Spreadsheet Sync',
        sumberDana
      });
    });
  }

  // 5. Process Realisasi SP2D
  const parsedRealisasi: Realisasi[] = [];
  if (realRows && realRows.length > 0) {
    realRows.forEach((row, idx) => {
      const rawSub = row['Kode_Sub_Kegiatan'] || row['Kode_Sub'] || row['kodeSub'];
      const rawBel = row['Kode_Rekening_Belanja'] || row['Kode_Belanja'] || row['kodeBelanja'];
      const kodeSub = cleanBudgetCode(rawSub);
      const kodeBelanja = extractCode(rawBel);
      if (!kodeSub || !kodeBelanja) return;

      const tahun = Number(row['Tahun'] || row['tahun']) || 2025;
      const tanggal = cleanDateValue(row['Tanggal'] || row['tanggal']) || `${tahun}-01-02`;
      const noSP2D = String(row['No_SP2D'] || row['noSP2D'] || '').trim();
      let noSPM = String(row['No_SPM'] || row['noSPM'] || '').trim();
      if (noSPM.includes('GMT') || noSPM.startsWith('Date(')) {
        noSPM = cleanDateValue(noSPM);
      }

      const uraian = String(row['Uraian_Belanja'] || row['Uraian'] || row['uraian'] || '').trim();
      const nilai = Number(row['Nilai_Realisasi_Rp'] || row['Nilai'] || row['nilai']) || 0;
      const rekanan = String(row['Rekanan_Penerima'] || row['Rekanan'] || row['rekanan'] || '').trim();
      const statusRaw = String(row['Status_Validasi'] || row['statusValidation'] || 'Disetujui PPK').trim();
      const statusValidation: 'Disetujui PPK' | 'Draft' | 'Ditolak' =
        statusRaw.toLowerCase().includes('tolak') ? 'Ditolak' :
        statusRaw.toLowerCase().includes('draft') ? 'Draft' : 'Disetujui PPK';
      const operator = String(row['Operator'] || row['operator'] || 'Spreadsheet Sync');

      const namaSub = String(row['Nama_Sub_Kegiatan'] || row['Nama_Sub'] || row['namaSub'] || '').trim();
      const namaBelanja = String(row['Nama_Rekening_Belanja'] || row['Nama_Belanja'] || row['namaBelanja'] || '').trim();

      const kdProg = cleanBudgetCode(row['Kode_Program'] || (kodeSub.includes('.') ? kodeSub.split('.').slice(0, 3).join('.') : '8.01.01'));
      const kdKeg = cleanBudgetCode(row['Kode_Kegiatan'] || (kodeSub.includes('.') ? kodeSub.split('.').slice(0, 5).join('.') : '8.01.01.1.02'));

      if (kodeSub && !subKegiatanMap.has(`${kodeSub}_${tahun}`)) {
        subKegiatanMap.set(`${kodeSub}_${tahun}`, {
          kodeProgram: kdProg,
          kodeKegiatan: kdKeg,
          kodeSub,
          namaSub: namaSub || `Sub Kegiatan ${kodeSub}`,
          tahun
        });
      }

      if (kodeBelanja && !belanjaMap.has(`${kodeBelanja}_${tahun}`)) {
        belanjaMap.set(`${kodeBelanja}_${tahun}`, {
          kodeBelanja,
          namaBelanja: namaBelanja || `Belanja Rekening ${kodeBelanja}`,
          jenisBelanja: 'Belanja Barang dan Jasa',
          tahun
        });
      }

      const parsedDate = new Date(tanggal);
      const bulan = !isNaN(parsedDate.getMonth()) ? parsedDate.getMonth() + 1 : 1;
      const stableId = String(row['ID'] || row['id'] || `REAL-${tahun}-${(noSP2D || 'SP2D').replace(/[^a-zA-Z0-9]/g, '')}-${idx}`);

      parsedRealisasi.push({
        id: stableId,
        tahun,
        tanggal,
        bulan,
        kodeProgram: kdProg,
        kodeKegiatan: kdKeg,
        kodeSub,
        kodeBelanja,
        uraian,
        nilai,
        noSP2D,
        noSPM,
        rekanan,
        operator,
        statusValidation,
        catatanValidation: '',
        buktiUrl: ''
      });
    });
  }

  // Ensure default Kesbangpol programs (8.01.01 - 8.01.06) are in Program map if not present
  const defaultKesbangpolPrograms = [
    { kode: '8.01.01', nama: 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI' },
    { kode: '8.01.02', nama: 'PROGRAM PENGUATAN IDEOLOGI PANCASILA DAN KARAKTER KEBANGSAAN' },
    { kode: '8.01.03', nama: 'PROGRAM PENINGKATAN PERAN PARTAI POLITIK DAN LEMBAGA PENDIDIKAN MELALUI PENDIDIKAN POLITIK' },
    { kode: '8.01.04', nama: 'PROGRAM PEMBERDAYAAN DAN PENGAWASAN ORGANISASI KEMASYARAKATAN' },
    { kode: '8.01.05', nama: 'PROGRAM PEMBINAAN DAN PENGEMBANGAN KETAHANAN EKONOMI, SOSIAL, DAN BUDAYA' },
    { kode: '8.01.06', nama: 'PROGRAM PENINGKATAN KEWASPADAAN NASIONAL DAN PENANGANAN KONFLIK SOSIAL' }
  ];

  [2025, 2026].forEach(yr => {
    defaultKesbangpolPrograms.forEach(p => {
      const key = `${p.kode}_${yr}`;
      if (!programMap.has(key)) {
        programMap.set(key, { kodeProgram: p.kode, namaProgram: p.nama, tahun: yr });
      }
    });
  });

  return {
    success: true,
    message: `Berhasil menarik ${programMap.size} Program, ${kegiatanMap.size} Kegiatan, ${subKegiatanMap.size} Sub Kegiatan, ${belanjaMap.size} Rekening, ${parsedAnggaran.length} Pagu Anggaran, dan ${parsedRealisasi.length} Realisasi dari Google Spreadsheet.`,
    programs: Array.from(programMap.values()),
    kegiatanList: Array.from(kegiatanMap.values()),
    subKegiatanList: Array.from(subKegiatanMap.values()),
    belanjaList: Array.from(belanjaMap.values()),
    anggaranList: parsedAnggaran,
    realisasiList: parsedRealisasi
  };
}

/**
 * Fallback via WebApp getAll endpoint if direct GViz is blocked.
 */
async function fetchViaWebAppFallback(spreadsheetId: string, webAppUrl: string): Promise<ExtractedSpreadsheetData> {
  const sep = webAppUrl.includes('?') ? '&' : '?';
  const fetchUrl = `${webAppUrl}${sep}action=getAll&spreadsheetId=${encodeURIComponent(spreadsheetId)}`;
  const res = await fetch(fetchUrl);
  if (!res.ok) throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
  const data = await res.json();

  const programMap = new Map<string, Program>();
  const kegiatanMap = new Map<string, Kegiatan>();
  const subKegiatanMap = new Map<string, SubKegiatan>();
  const belanjaMap = new Map<string, Belanja>();

  if (Array.isArray(data.programList)) {
    data.programList.forEach((p: any) => {
      const kode = cleanBudgetCode(p.kodeProgram || p.Kode_Program);
      const nama = String(p.namaProgram || p.Nama_Program || '').trim();
      const th = Number(p.tahun || p.Tahun) || 2025;
      if (kode && nama) programMap.set(`${kode}_${th}`, { kodeProgram: kode, namaProgram: nama, tahun: th });
    });
  }

  const parsedRealisasi: Realisasi[] = (data.realisasiList || []).map((r: any, idx: number) => {
    const kodeSub = cleanBudgetCode(r.kodeSub);
    const kodeBelanja = extractCode(r.kodeBelanja);
    const tahun = Number(r.tahun) || 2025;
    const kdProg = cleanBudgetCode(r.kodeProgram || (kodeSub.includes('.') ? kodeSub.split('.').slice(0, 3).join('.') : '8.01.01'));
    const kdKeg = cleanBudgetCode(r.kodeKegiatan || (kodeSub.includes('.') ? kodeSub.split('.').slice(0, 5).join('.') : '8.01.01.1.02'));

      const statusRaw = String(r.statusValidation || 'Disetujui PPK').trim();
      const statusValidation: 'Disetujui PPK' | 'Draft' | 'Ditolak' =
        statusRaw.toLowerCase().includes('tolak') ? 'Ditolak' :
        statusRaw.toLowerCase().includes('draft') ? 'Draft' : 'Disetujui PPK';

      return {
        id: r.id || `REAL-${tahun}-${idx}`,
        tahun,
        tanggal: cleanDateValue(r.tanggal) || `${tahun}-01-02`,
        bulan: Number(r.bulan) || 1,
        kodeProgram: kdProg,
        kodeKegiatan: kdKeg,
        kodeSub,
        kodeBelanja,
        uraian: r.uraian || '',
        nilai: Number(r.nilai) || 0,
        noSP2D: r.noSP2D || '',
        noSPM: cleanDateValue(r.noSPM) || r.noSPM || '',
        rekanan: r.rekanan || '',
        operator: r.operator || 'Spreadsheet Import',
        statusValidation,
        catatanValidation: '',
        buktiUrl: ''
      };
  });

  const parsedAnggaran: Anggaran[] = (data.anggaranList || []).map((a: any, idx: number) => {
    const kodeSub = cleanBudgetCode(a.kodeSub);
    const kodeBelanja = extractCode(a.kodeBelanja);
    const tahun = Number(a.tahun) || 2025;
    const kdProg = cleanBudgetCode(a.kodeProgram || (kodeSub.includes('.') ? kodeSub.split('.').slice(0, 3).join('.') : '8.01.01'));
    const kdKeg = cleanBudgetCode(a.kodeKegiatan || (kodeSub.includes('.') ? kodeSub.split('.').slice(0, 5).join('.') : '8.01.01.1.01'));

    const pagu = Number(a.pagu || a.nilaiMurni || a.nilai) || 0;
    const revisi = Number(a.revisi || a.nilaiPerubahan) || 0;
    const paguAkhir = Number(a.paguAkhir || (pagu + revisi) || a.nilai) || 0;

    return {
      id: a.id || `ANG-${tahun}-${idx}`,
      tahun,
      kodeProgram: kdProg,
      kodeKegiatan: kdKeg,
      kodeSub,
      kodeBelanja,
      namaBelanja: a.namaBelanja || `Belanja ${kodeBelanja}`,
      pagu,
      revisi,
      nilaiSPD: paguAkhir,
      paguAkhir,
      tanggalInput: new Date().toISOString().split('T')[0],
      operator: 'Spreadsheet Import',
      sumberDana: !isNaN(Number(a.sumberDana)) ? 'PAD' : (a.sumberDana || 'PAD')
    };
  });

  return {
    success: true,
    message: `Berhasil menarik ${parsedAnggaran.length} Pagu Anggaran dan ${parsedRealisasi.length} Realisasi dari WebApp.`,
    programs: Array.from(programMap.values()),
    kegiatanList: Array.from(kegiatanMap.values()),
    subKegiatanList: Array.from(subKegiatanMap.values()),
    belanjaList: Array.from(belanjaMap.values()),
    anggaranList: parsedAnggaran,
    realisasiList: parsedRealisasi
  };
}
