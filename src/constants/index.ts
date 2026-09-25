// Constants and Presets for Oval Studio

export const INDONESIAN_VOICES = [
  { id: 'Fenrir', name: 'Ardi Pratama', desc: 'Pria • Tegas, Profesional' },
  { id: 'Puck', name: 'Bima Saputra', desc: 'Pria • Santai, Hangat' },
  { id: 'Charon', name: 'Dimas Wicaksono', desc: 'Pria • Dalam, Berwibawa' },
  { id: 'Aoede', name: 'Sinta Maharani', desc: 'Wanita • Lembut, Elegan' },
  { id: 'Kore', name: 'Nabila Putri', desc: 'Wanita • Ceria, Fresh' },
  { id: 'Zephyr', name: 'Ayu Lestari', desc: 'Wanita • Hangat, Storytelling' }
];

export const STYLE_PRESETS = [
  'Normal', 'Semangat', 'Tenang', 'Bahagia', 'Sedih', 
  'Tegas', 'Misterius', 'Marah', 'Berbisik', 'Custom'
];

export const SPEED_OPTIONS = [
  { label: 'Lambat (0.75x)', value: 'lambat', rate: 0.75 },
  { label: 'Normal (1.0x)', value: 'normal', rate: 1.0 },
  { label: 'Cepat (1.25x)', value: 'cepat', rate: 1.25 }
];

export const INITIAL_BG_LIST = [
  { name: 'Studio Minimalis', desc: 'Latar studio bersih dengan pencahayaan profesional.' },
  { name: 'Kafe Modern', desc: 'Suasana kafe estetik dengan cahaya hangat.' },
  { name: 'Alam Terbuka', desc: 'Pemandangan alam yang indah dan menyegarkan.' },
  { name: 'Jalanan Kota', desc: 'Nuansa urban perkotaan yang modern dan dinamis.' },
  { name: 'Ruang Keluarga', desc: 'Interior rumah yang hangat dan nyaman.' },
  { name: 'Pantai Tropis', desc: 'Suasana pantai cerah dengan laut biru.' },
  { name: 'Pegunungan', desc: 'Latar belakang gunung yang megah dan tenang.' },
  { name: 'Cyberpunk', desc: 'Kota masa depan dengan gemerlap lampu neon.' },
  { name: 'Klasik Elegan', desc: 'Nuansa mewah dengan arsitektur klasik.' },
  { name: 'Abstrak Geometris', desc: 'Pola geometris modern dengan warna kontras.' },
  { name: 'Custom', desc: 'Ketik deskripsi latar belakang Anda sendiri.' }
];

export const CAMERA_ANGLES = [
  { name: 'Eye Level', desc: 'Sejajar dengan mata subjek.' },
  { name: 'Close Up', desc: 'Fokus pada wajah atau detail produk.' },
  { name: 'Extreme Close Up', desc: 'Sangat dekat untuk menonjolkan tekstur.' },
  { name: 'Medium Shot', desc: 'Menampilkan subjek dari pinggang ke atas.' },
  { name: 'Full Body', desc: 'Menampilkan seluruh subjek beserta lingkungan.' },
  { name: 'Over Shoulder', desc: 'Diambil dari belakang bahu subjek lain.' },
  { name: 'POV', desc: 'Sudut pandang orang pertama (Point of View).' },
  { name: 'Selfie Camera', desc: 'Terlihat seperti diambil sendiri (lengan terlihat).' },
  { name: 'Mirror Shot', desc: 'Pantulan dari cermin dengan estetik.' },
  { name: 'Low Angle', desc: 'Diambil dari bawah, memberi kesan megah/dominan.' },
  { name: 'High Angle', desc: 'Diambil dari atas, memberi kesan mungil/luas.' },
  { name: 'Product Focus', desc: 'Fokus tajam pada produk, background blur (bokeh).' }
];

export const VISUAL_STYLES = [
  { name: 'UGC Natural', desc: 'Natural seperti video iPhone.' },
  { name: 'Mirror Check', desc: 'Gaya bercermin estetik.' },
  { name: 'POV Hand Review', desc: 'Tangan memegang & me-review produk.' },
  { name: 'Storyboard', desc: 'Seperti adegan dalam naskah film tunggal (konsisten).' },
  { name: 'Beauty Influencer', desc: 'Pencahayaan ring-light, fokus wajah/make-up.' },
  { name: 'Lifestyle Content', desc: 'Aktivitas sehari-hari yang *relatable*.' },
  { name: 'Product Showcase', desc: 'Bersih, elegan, menonjolkan fitur produk.' },
  { name: 'Cinematic UGC', desc: 'UGC dengan sentuhan warna sinematik.' },
  { name: 'Luxury Branding', desc: 'Elegan, *high-end*, dan eksklusif.' },
  { name: 'Testimonial Style', desc: 'Seperti sedang berbicara/testimoni ke kamera.' },
  { name: 'Before After', desc: 'Konsep transisi/perubahan kondisi.' }
];

export const ASPECT_RATIOS = [
  { label: '9:16', value: '9:16', desc: 'Portrait' },
  { label: '1:1', value: '1:1', desc: 'Square' },
  { label: '16:9', value: '16:9', desc: 'Landscape' }
];

export const GENERATE_OPTIONS = [
  { label: '2 Foto', value: 2 },
  { label: '4 Foto', value: 4 },
  { label: '8 Foto', value: 8 },
  { label: '16 Foto', value: 16 }
];

export const ANIMATION_VISUAL_OPTIONS = [
  'Pixar 3D Animation', 'Anime Studio Ghibli', 'Claymation (Stop Motion)', 
  'Cinematic Photorealistic', '2D Flat Cartoon', 'Watercolor Sketch',
  'Cyberpunk Neon Render', 'Fantasy Epic Digital Painting', 'Chibi 3D', 'Custom'
];

export const ANIMATION_NARRATIVE_OPTIONS = [
  'Storytelling (Hero Journey)', 
  'Promosi PPDB Sekolah (Penerimaan Siswa Baru)',
  'Edukasi / Penjelasan', 
  'Aksi & Petualangan', 
  'Promosi / Marketing', 
  'Komedi Ringan', 
  'Sinematik Dramatis', 'Custom'
];
