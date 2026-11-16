let currentRole = 'shipper'; // 'shipper' (Chủ hàng) hoặc 'carrier' (Nhà xe)
let activePrice = 3400000;
let isEscrowFunded = false;
let selectedTrackingId = "TM-801";
let trackingMapInstance = null;
let currentUser = null; // Lưu tài khoản đang đăng nhập

// Cấu hình hệ thống (Admin có thể thay đổi)
let systemConfig = {
  platformFeePercent: 4,
  basePricePerTon: 520000,
  maxDeviationPercent: 10
};

// ==========================================
// KHỞI TẠO DỮ LIỆU GỐC & ĐỒNG BỘ LOCALSTORAGE DATABASE
// ==========================================
const defaultEmptyTruckTrips = [
  {
    id: 1,
    partner: "Nhà xe Hùng Phát",
    origin: "Đà Nẵng",
    dest: "Quy Nhơn",
    cargo: "Nhận hàng khô / Nông sản",
    weight: 8.0,
    type: "Thùng bạt",
    deviation: "3.2%",
    match: 97,
    price: 3400000,
    time: "14:00 Chiều nay",
    approved: true
  },
  {
    id: 2,
    partner: "Đội xe Vận tải Miền Trung",
    origin: "Đà Nẵng",
    dest: "Quảng Ngãi",
    cargo: "Nhận bao bì / Hàng tiêu dùng",
    weight: 5.0,
    type: "Thùng kín",
    deviation: "5.1%",
    match: 94,
    price: 2200000,
    time: "16:30 Chiều nay",
    approved: true
  },
  {
    id: 3,
    partner: "Vận tải Đông Lạnh Tuấn Hưng",
    origin: "Đà Nẵng",
    dest: "Quy Nhơn",
    cargo: "Nhận thủy hải sản / Thực phẩm",
    weight: 5.0,
    type: "Đông lạnh",
    deviation: "7.4%",
    match: 89,
    price: 3800000,
    time: "07:00 Sáng mai",
    approved: true
  }
];

const defaultShipperOrders = [
  {
    id: 101,
    partner: "Công ty Nông sản Hòa Vang",
    origin: "KCN Hòa Khánh Đà Nẵng",
    dest: "Cảng Quy Nhơn",
    cargo: "Nông sản",
    weight: 6.0,
    type: "Thùng bạt",
    deviation: "2.8%",
    match: 98,
    price: 3500000,
    time: "Bốc hàng trước 15:00 hôm nay",
    approved: true
  },
  {
    id: 102,
    partner: "Nhà máy Bao bì Việt Úc",
    origin: "Đà Nẵng",
    dest: "KCN Tịnh Phong Quảng Ngãi",
    cargo: "Bao bì / Carton",
    weight: 4.5,
    type: "Thùng kín",
    deviation: "4.5%",
    match: 93,
    price: 2300000,
    time: "Giao trong ngày",
    approved: true
  },
  {
    id: 103,
    partner: "HTX Thủy sản Sơn Trà",
    origin: "Cảng Cá Sơn Trà Đà Nẵng",
    dest: "Quy Nhơn",
    cargo: "Thực phẩm / Hải sản",
    weight: 4.0,
    type: "Đông lạnh",
    deviation: "6.0%",
    match: 91,
    price: 3900000,
    time: "Sáng mai 06:30",
    approved: true
  }
];

const defaultUsersDB = [
  {
    id: 1,
    fullName: "Ban Quản Trị TruckM4te (Admin)",
    email: "admin@truckm4te.vn",
    phone: "0905000111",
    password: "admin123",
    role: "admin",
    extraInfo: "Toàn quyền hệ thống DTU Startup",
    status: "Hoạt động"
  },
  {
    id: 2,
    fullName: "Công ty Nông sản Hòa Vang",
    email: "hoavang@shipper.vn",
    phone: "0905123456",
    password: "123456",
    role: "shipper",
    extraInfo: "MST: 0401882910 - KCN Hòa Khánh",
    status: "Hoạt động"
  },
  {
    id: 3,
    fullName: "Nhà xe Hùng Phát (28 đầu xe)",
    email: "hungphat@carrier.vn",
    phone: "0905112334",
    password: "123456",
    role: "carrier",
    extraInfo: "Biển số chính: 43C-289.14 (Thùng bạt 8T)",
    status: "Hoạt động"
  },
  {
    id: 4,
    fullName: "Nhà máy Bao bì Việt Úc",
    email: "vietuc@packaging.vn",
    phone: "0914778899",
    password: "123456",
    role: "shipper",
    extraInfo: "MST: 0402119002 - Liên Chiểu, Đà Nẵng",
    status: "Hoạt động"
  }
];

const defaultTrackingList = [
  {
    code: "TM-801",
    route: "Đà Nẵng ➔ Quy Nhơn",
    cargo: "6.0 Tấn Nông sản khô (Thùng bạt)",
    shipper: "Công ty Nông sản Hòa Vang",
    carrier: "Nhà xe Hùng Phát · Tài xế Nguyễn Văn Hùng (0905.112.334)",
    plate: "43C-289.14",
    price: "3.400.000 đ",
    rawPrice: 3400000,
    progress: 65,
    province: "Tỉnh Quảng Ngãi (Khu vực Đức Phổ - Sa Huỳnh)",
    location: "Đang qua QL1A Sa Huỳnh, Quảng Ngãi (Cách điểm trả 115 km)",
    eta: "Dự kiến đến nơi lúc 18:45 hôm nay",
    escrowStatus: "Đã khóa tiền an toàn trong Ví Escrow",
    coords: {
      origin: [16.0544, 108.2022],
      current: [14.6644, 109.0561],
      dest: [13.7829, 109.2196]
    },
    steps: [
      { time: "13:15", title: "Chủ hàng nạp ký quỹ Escrow thành công", desc: "Hệ thống xác nhận khóa 3.400.000đ bảo chứng.", done: true },
      { time: "14:10", title: "Bốc hàng & Chụp ảnh niêm phong tại KCN Hòa Khánh", desc: "Đủ 240 bao hàng nguyên vẹn, không rách ướt.", done: true },
      { time: "16:30", title: "Đang di chuyển trên Quốc lộ 1A (Qua Quảng Ngãi)", desc: "Độ lệch cung đường thực tế: 3.1% (Đạt chuẩn <10%).", done: true, current: true },
      { time: "18:45 (Dự kiến)", title: "Giao hàng & Ký biên bản điện tử e-POD tại Quy Nhơn", desc: "Tự động giải ngân cước về ví Nhà xe sau khi ký.", done: false }
    ]
  },
  {
    code: "TM-802",
    route: "Quảng Ngãi ➔ Đà Nẵng",
    cargo: "8.0 Tấn Vật liệu bao bì (Thùng kín)",
    shipper: "Nhà máy Bao bì Việt Úc",
    carrier: "Đội xe Vận tải Miền Trung · Tài xế Trần Đình Trọng (0914.889.002)",
    plate: "76C-094.22",
    price: "2.600.000 đ",
    rawPrice: 2600000,
    progress: 35,
    province: "Tỉnh Quảng Nam (Khu vực Núi Thành - Tam Kỳ)",
    location: "Đang qua cao tốc Đà Nẵng - Quảng Ngãi đoạn Núi Thành",
    eta: "Dự kiến đến nơi lúc 17:30 hôm nay",
    escrowStatus: "Đã khóa tiền an toàn trong Ví Escrow",
    coords: {
      origin: [15.1214, 108.8044],
      current: [15.4219, 108.6514],
      dest: [16.0544, 108.2022]
    },
    steps: [
      { time: "14:00", title: "Chủ hàng nạp ký quỹ Escrow thành công", desc: "Khóa 2.600.000đ.", done: true },
      { time: "14:45", title: "Xe xuất bến rời Quảng Ngãi hướng về Đà Nẵng", desc: "Đã kiểm tra thùng kín khô ráo.", done: true, current: true },
      { time: "17:30 (Dự kiến)", title: "Giao hàng & Ký e-POD tại Đà Nẵng", desc: "Giải ngân tự động sau khi xác nhận.", done: false }
    ]
  },
  {
    code: "TM-803",
    route: "Đà Nẵng ➔ Hà Nội",
    cargo: "15.0 Tấn Hàng tiêu dùng (Thùng bạt)",
    shipper: "Công ty Phân phối Miền Trung",
    carrier: "Vận tải Bắc Nam Express · Tài xế Lê Minh Tuấn",
    plate: "43H-051.77",
    price: "8.200.000 đ",
    rawPrice: 8200000,
    progress: 100,
    province: "Thành phố Hà Nội (KCN Ngọc Hồi - Thanh Trì)",
    location: "Đã giao hàng thành công tại kho KCN Ngọc Hồi, Hà Nội",
    eta: "Hoàn tất giao nhận",
    escrowStatus: "Đã giải ngân tự động qua e-POD",
    coords: {
      origin: [16.0544, 108.2022],
      current: [20.9508, 105.8442],
      dest: [20.9508, 105.8442]
    },
    steps: [
      { time: "Hôm qua", title: "Ký quỹ Escrow & Bốc hàng tại Đà Nẵng", desc: "Khóa 8.200.000đ.", done: true },
      { time: "08:30 Sáng nay", title: "Đến điểm trả hàng & Ký e-POD thành công", desc: "Đã giải ngân 7.872.000đ về ví Nhà xe.", done: true, current: true }
    ]
  }
];

// Đọc dữ liệu từ LocalStorage (Nếu chưa có thì nạp dữ liệu gốc)
let emptyTruckTrips = JSON.parse(localStorage.getItem('tm4_emptyTruckTrips')) || JSON.parse(JSON.stringify(defaultEmptyTruckTrips));
let shipperOrders = JSON.parse(localStorage.getItem('tm4_shipperOrders')) || JSON.parse(JSON.stringify(defaultShipperOrders));
let usersDB = JSON.parse(localStorage.getItem('tm4_usersDB')) || JSON.parse(JSON.stringify(defaultUsersDB));
let trackingList = JSON.parse(localStorage.getItem('tm4_trackingList')) || JSON.parse(JSON.stringify(defaultTrackingList));

function saveDatabase() {
  localStorage.setItem('tm4_emptyTruckTrips', JSON.stringify(emptyTruckTrips));
  localStorage.setItem('tm4_shipperOrders', JSON.stringify(shipperOrders));
  localStorage.setItem('tm4_usersDB', JSON.stringify(usersDB));
  localStorage.setItem('tm4_trackingList', JSON.stringify(trackingList));
}

// ==========================================
// 1. CƠ CHẾ CHUYỂN TAB SPA
// ==========================================
function switchTab(tabName) {
  if (tabName === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
    alert("Khu vực này chỉ dành cho Quản trị viên (Admin)! Vui lòng đăng nhập tài khoản Admin.");
    openAuthModal('login');
    return;
  }

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('hidden');
    panel.classList.remove('block');
  });

  const activeView = document.getElementById(`view-${tabName}`);
  if (activeView) {
    activeView.classList.remove('hidden');
    activeView.classList.add('block');
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-emerald-700', 'bg-emerald-50');
  });
  const activeNavBtn = document.getElementById(`nav-${tabName}`);
  if (activeNavBtn && tabName !== 'admin') {
    activeNavBtn.classList.add('text-emerald-700', 'bg-emerald-50');
  }

  if (tabName === 'tracking') {
    renderTrackingView();
  }
  if (tabName === 'admin') {
    renderAdminDashboard();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 2. CHỨC NĂNG ĐĂNG NHẬP, ĐĂNG KÝ & PHÂN QUYỀN
// ==========================================
function openAuthModal(mode) {
  document.getElementById('modalAuth').classList.remove('hidden');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const tabLogin = document.getElementById('tabBtnLogin');
  const tabRegister = document.getElementById('tabBtnRegister');
  const title = document.getElementById('authModalTitle');

  if (mode === 'login') {
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
    tabLogin.className = "py-2 rounded-lg bg-white text-emerald-700 shadow-sm transition";
    tabRegister.className = "py-2 rounded-lg text-slate-500 hover:text-slate-800 transition";
    title.textContent = "Đăng nhập hệ thống TruckM4te";
  } else {
    formLogin.classList.add('hidden');
    formRegister.classList.remove('hidden');
    tabRegister.className = "py-2 rounded-lg bg-white text-emerald-700 shadow-sm transition";
    tabLogin.className = "py-2 rounded-lg text-slate-500 hover:text-slate-800 transition";
    title.textContent = "Đăng ký tài khoản đối tác mới";
    toggleRegisterFields();
  }
}

function closeAuthModal() {
  document.getElementById('modalAuth').classList.add('hidden');
}

function toggleRegisterFields() {
  const role = document.getElementById('regRole').value;
  if (role === 'shipper') {
    document.getElementById('regNameLabel').textContent = "Tên Doanh nghiệp / Chủ hàng";
    document.getElementById('regFullName').placeholder = "VD: Công ty Nông sản Miền Trung";
    document.getElementById('regExtraLabel').textContent = "Mã số thuế / Địa chỉ kho hàng";
    document.getElementById('regExtraInfo').placeholder = "VD: MST 040192xxx - KCN Hòa Khánh";
  } else {
    document.getElementById('regNameLabel').textContent = "Tên Nhà xe / Chủ phương tiện";
    document.getElementById('regFullName').placeholder = "VD: Nhà xe Vận tải Bình Minh";
    document.getElementById('regExtraLabel').textContent = "Biển số xe & Loại thùng tải trọng";
    document.getElementById('regExtraInfo').placeholder = "VD: 43C-556.88 - Xe thùng kín 8 Tấn";
  }
}

function submitLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById('loginIdentifier').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  const foundUser = usersDB.find(u =>
    (u.email.toLowerCase() === identifier || u.phone === identifier) && u.password === password
  );

  if (!foundUser) {
    alert("Sai thông tin Email/SĐT hoặc Mật khẩu! Bạn có thể bấm nút 'Đăng nhập nhanh Demo' bên dưới.");
    return;
  }

  if (foundUser.status !== "Hoạt động") {
    alert("Tài khoản này hiện đang bị khóa bởi Quản trị viên Admin!");
    return;
  }

  loginSuccess(foundUser);
}

function quickDemoLogin(roleType) {
  let targetUser = null;
  if (roleType === 'admin') {
    targetUser = usersDB.find(u => u.role === 'admin');
  } else if (roleType === 'shipper') {
    targetUser = usersDB.find(u => u.role === 'shipper');
  } else {
    targetUser = usersDB.find(u => u.role === 'carrier');
  }

  if (targetUser) {
    loginSuccess(targetUser);
  }
}

function submitRegister(e) {
  e.preventDefault();
  const role = document.getElementById('regRole').value;
  const fullName = document.getElementById('regFullName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const extraInfo = document.getElementById('regExtraInfo').value.trim();
  const password = document.getElementById('regPassword').value;

  if (usersDB.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    alert("Email này đã được đăng ký trên hệ thống! Vui lòng chọn email khác.");
    return;
  }

  const newUser = {
    id: Date.now(),
    fullName,
    email,
    phone,
    password,
    role,
    extraInfo,
    status: "Hoạt động"
  };

  usersDB.push(newUser);
  saveDatabase();
  alert(`Đăng ký thành công tài khoản ${role === 'shipper' ? 'Chủ hàng' : 'Nhà xe'}: ${fullName}!`);
  document.getElementById('formRegister').reset();
  loginSuccess(newUser);
}

function loginSuccess(user) {
  currentUser = user;
  localStorage.setItem('tm4_currentUser', JSON.stringify(user));
  closeAuthModal();
  updateAuthHeaderUI();

  if (user.role === 'admin') {
    switchTab('admin');
  } else if (user.role === 'carrier') {
    changeRole('carrier');
  } else {
    changeRole('shipper');
  }
}

function logoutAccount() {
  currentUser = null;
  localStorage.removeItem('tm4_currentUser');
  updateAuthHeaderUI();
  switchTab('home');
}

function updateAuthHeaderUI() {
  const authArea = document.getElementById('authHeaderArea');
  const navAdminBtn = document.getElementById('nav-admin');

  if (currentUser) {
    if (currentUser.role === 'admin') {
      navAdminBtn.classList.remove('hidden');
    } else {
      navAdminBtn.classList.add('hidden');
    }

    const roleBadge = currentUser.role === 'admin'
      ? `<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold text-[10px]">ADMIN</span>`
      : (currentUser.role === 'shipper'
        ? `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">CHỦ HÀNG</span>`
        : `<span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px]">NHÀ XE</span>`);

    authArea.innerHTML = `
      <div class="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
        ${roleBadge}
        <span class="font-bold text-slate-800 max-w-[130px] truncate">${currentUser.fullName}</span>
        <button onclick="logoutAccount()" title="Đăng xuất" class="text-red-500 hover:text-red-700 font-bold ml-1">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    `;
  } else {
    navAdminBtn.classList.add('hidden');
    authArea.innerHTML = `
      <button onclick="openAuthModal('login')" class="border border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold transition">
        Đăng nhập
      </button>
      <button onclick="openAuthModal('register')" class="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm hidden sm:inline-block">
        Đăng ký
      </button>
    `;
  }
}

// ==========================================
// 3. CHỨC NĂNG CHO 2 NÚT: CHỦ HÀNG & NHÀ XE
// ==========================================
function changeRole(role) {
  currentRole = role;
  const btnShipper = document.getElementById('role-shipper');
  const btnCarrier = document.getElementById('role-carrier');
  const isShipper = role === 'shipper';

  if (isShipper) {
    btnShipper.className = "px-2.5 py-1 rounded-lg bg-emerald-600 text-white transition shadow-sm";
    btnCarrier.className = "px-2.5 py-1 rounded-lg text-slate-600 hover:text-emerald-700 transition";
  } else {
    btnCarrier.className = "px-2.5 py-1 rounded-lg bg-emerald-600 text-white transition shadow-sm";
    btnShipper.className = "px-2.5 py-1 rounded-lg text-slate-600 hover:text-emerald-700 transition";
  }

  document.getElementById('marketRoleBadge').textContent = isShipper
    ? "Chế độ Chủ hàng: Đang tìm xe rỗng chiều về"
    : "Chế độ Nhà xe: Đang tìm đơn hàng cần ghép chuyến";
  document.getElementById('marketHeading').textContent = isShipper
    ? "Sàn kết nối chuyến xe rỗng chiều về"
    : "Danh sách đơn hàng cần tìm xe chiều về";
  document.getElementById('marketSubheading').textContent = isShipper
    ? "Danh sách các chuyến xe chiều về sẵn sàng ghép hàng được cập nhật thời gian thực"
    : "Danh sách các lô hàng nằm trên cung đường quay đầu (độ lệch <10%) để nhà xe nhận ghép";
  document.getElementById('btnOpenPost').innerHTML = isShipper
    ? `<i class="fa-solid fa-plus"></i> <span>Đăng đơn cần gửi hàng</span>`
    : `<i class="fa-solid fa-plus"></i> <span>Đăng chuyến xe rỗng</span>`;

  renderMarketCards(isShipper ? emptyTruckTrips : shipperOrders);

  document.getElementById('copilotRoleTag').textContent = isShipper
    ? "Trợ lý AI dành cho Chủ hàng (Tạo đơn bằng giọng nói)"
    : "Trợ lý AI dành cho Nhà xe (Báo xe rỗng rảnh tay)";
  document.getElementById('copilotLabel').textContent = isShipper
    ? "Nhập nhu cầu gửi hàng hoặc nhấn Mic để nói:"
    : "Nhập thông tin xe trống chiều về hoặc nhấn Mic để nói:";
  document.getElementById('copilotInput').value = isShipper
    ? "Cần gửi 6 tấn nông sản từ KCN Hòa Khánh Đà Nẵng về Cảng Quy Nhơn chiều nay bằng xe thùng bạt"
    : "Xe 8 tấn thùng kín rỗng từ Tam Kỳ Quảng Nam đi KCN Sóng Thần Bình Dương chiều nay nhận chở bao bì";

  executeCopilotNLP();
  updateBiddingByRole();
  updateEscrowByRole();
  updateDashboardByRole();
  renderTrackingView();
}

// ==========================================
// 4. RENDER SÀN VẬN TẢI & BỘ LỌC
// ==========================================
function renderMarketCards(list) {
  const container = document.getElementById('marketCardsContainer');
  container.innerHTML = '';
  const isShipper = currentRole === 'shipper';

  if (list.length === 0) {
    container.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-400 text-xs">Không tìm thấy chuyến phù hợp với bộ lọc hiện tại.</div>`;
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = "bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-300 transition flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-3">
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Khớp AI: ${item.match}%
          </span>
          <span class="text-[11px] text-slate-400 font-medium">Độ lệch: ${item.deviation}</span>
        </div>
        <h4 class="font-extrabold text-slate-900 text-sm mb-1">${item.partner}</h4>
        <div class="text-xs text-slate-600 mb-3 font-semibold">
          <span class="text-emerald-700">${item.origin}</span> ➔ <span class="text-emerald-700">${item.dest}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl mb-4">
          <div>${isShipper ? 'Tải trống:' : 'Khối lượng:'} <b>${item.weight}T</b></div>
          <div>Loại xe: <b>${item.type}</b></div>
          <div class="col-span-2">Mặt hàng: <b>${item.cargo || 'Hàng tổng hợp'}</b></div>
          <div class="col-span-2">Thời gian: <b>${item.time}</b></div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-slate-400 block uppercase font-bold">${isShipper ? 'Giá xe chào' : 'Giá chủ hàng đề xuất'}</span>
          <span class="font-black text-emerald-700 text-sm">${item.price.toLocaleString('vi-VN')} đ</span>
        </div>
        <button onclick="openBiddingFor(${item.id})" class="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition">
          ${isShipper ? 'Đặt xe & Thương lượng' : 'Nhận ghép & Chào giá'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function applyMarketFilter() {
  const o = document.getElementById('filterOrigin').value.toLowerCase().trim();
  const d = document.getElementById('filterDest').value.toLowerCase().trim();
  const t = document.getElementById('filterType').value;
  const sourceList = currentRole === 'shipper' ? emptyTruckTrips : shipperOrders;

  const filtered = sourceList.filter(item => {
    const matchO = o === '' || item.origin.toLowerCase().includes(o);
    const matchD = d === '' || item.dest.toLowerCase().includes(d);
    const matchT = t === '' || item.type === t;
    return matchO && matchD && matchT;
  });

  renderMarketCards(filtered);
}

// ==========================================
// 5. ĐẤU GIÁ CƯỚC THEO VAI TRÒ
// ==========================================
function openBiddingFor(id) {
  const list = currentRole === 'shipper' ? emptyTruckTrips : shipperOrders;
  const item = list.find(x => x.id === id);
  if (item) {
    activePrice = item.price;
    document.getElementById('inputBidDeal').value = item.price;
    document.getElementById('biddingRoomHeading').textContent = `Phòng thương lượng: ${item.origin} - ${item.dest} (${item.weight}T)`;
    document.getElementById('biddingPartnerText').textContent = `Đối tác: ${item.partner}`;
  }
  switchTab('bidding');
}

function updateBiddingByRole() {
  const isShipper = currentRole === 'shipper';
  const feePct = systemConfig.platformFeePercent;
  const feeAmount = Math.round(activePrice * (feePct / 100));
  const netCarrier = activePrice - feeAmount;

  document.getElementById('biddingRoleSub').textContent = isShipper
    ? "Bạn đang thương lượng với tư cách Chủ hàng dựa trên khung giá Price Benchmark."
    : "Bạn đang chào giá nhận hàng với tư cách Nhà xe (không lo sàn ép chiết khấu).";

  document.getElementById('biddingChatLog').innerHTML = isShipper
    ? `
      <div class="p-2.5 rounded-xl bg-slate-100 text-slate-700 max-w-[80%]"><b>Hệ thống AI:</b> Đã ghép tuyến phù hợp 97%. Độ lệch lộ trình 3.2% so với cung đường gốc.</div>
      <div class="p-2.5 rounded-xl bg-slate-100 text-slate-700 max-w-[80%]"><b>Nhà xe Hùng Phát:</b> Xe mình 8 tấn thùng bạt quay đầu về Quy Nhơn chiều nay, nhận chở hàng của bạn giá 3.400.000đ bao bến bãi nhé.</div>
    `
    : `
      <div class="p-2.5 rounded-xl bg-slate-100 text-slate-700 max-w-[80%]"><b>Hệ thống AI:</b> Đơn hàng 6 tấn nông sản nằm ngay trên trục đường quay đầu của xe bạn (lệch 2.8%).</div>
      <div class="p-2.5 rounded-xl bg-slate-100 text-slate-700 max-w-[80%]"><b>Công ty Nông sản Hòa Vang:</b> Bên em cần chuyển 6 tấn hàng đóng bao về Quy Nhơn chiều nay, ngân sách 3.400.000đ xe bác nhận được không ạ?</div>
    `;

  document.getElementById('priceSummaryTitle').textContent = isShipper
    ? "Phân tích cấu thành cước (Góc nhìn Chủ hàng)"
    : "Doanh thu thực nhận (Góc nhìn Nhà xe)";

  document.getElementById('priceSummaryBox').innerHTML = isShipper
    ? `
      <div class="flex justify-between text-slate-600"><span>Cước nguyên chuyến thị trường:</span><span class="line-through text-slate-400">4.800.000 đ</span></div>
      <div class="flex justify-between text-emerald-700 font-bold"><span>Giá xe rỗng chiều về TruckM4te:</span><span>${activePrice.toLocaleString('vi-VN')} đ</span></div>
      <div class="flex justify-between text-slate-600"><span>Tiết kiệm cho chủ hàng:</span><span class="font-bold text-emerald-600">1.400.000 đ (-29.1%)</span></div>
    `
    : `
      <div class="flex justify-between text-slate-600"><span>Doanh thu nếu chạy rỗng chiều về:</span><span class="text-slate-400">0 đ</span></div>
      <div class="flex justify-between text-emerald-700 font-bold"><span>Giá cước ghép chuyến chiều về:</span><span>${activePrice.toLocaleString('vi-VN')} đ</span></div>
      <div class="flex justify-between text-slate-600"><span>Phí sàn TruckM4te (${feePct}%):</span><span>-${feeAmount.toLocaleString('vi-VN')} đ</span></div>
      <div class="flex justify-between text-emerald-700 font-extrabold pt-2 border-t border-slate-100"><span>Thực nhận về ví Nhà xe:</span><span>${netCarrier.toLocaleString('vi-VN')} đ</span></div>
    `;
}

function sendBidMessage() {
  const val = parseInt(document.getElementById('inputBidDeal').value);
  if (!val || val <= 0) return;
  activePrice = val;
  const chat = document.getElementById('biddingChatLog');
  const me = currentRole === 'shipper' ? 'Bạn (Chủ hàng)' : 'Bạn (Nhà xe)';
  const partner = currentRole === 'shipper' ? 'Nhà xe Hùng Phát' : 'Công ty Nông sản Hòa Vang';
  chat.innerHTML += `
    <div class="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100 max-w-[80%] ml-auto"><b>${me}:</b> Mình đề xuất chốt mức giá <b>${val.toLocaleString('vi-VN')} đ</b> nhé!</div>
    <div class="p-2.5 rounded-xl bg-slate-100 text-slate-700 max-w-[80%]"><b>${partner}:</b> Đồng ý mức giá ${val.toLocaleString('vi-VN')} đ! Mời chuyển sang Ví ký quỹ Escrow để khóa đơn.</div>
  `;
  chat.scrollTop = chat.scrollHeight;
  updateBiddingByRole();
}

function acceptAndLockEscrow() {
  const price = parseInt(document.getElementById('inputBidDeal').value) || 3400000;
  activePrice = price;
  isEscrowFunded = false;
  updateEscrowByRole();
  switchTab('escrow');
}

// ==========================================
// 6. KÝ QUỸ ESCROW THEO VAI TRÒ
// ==========================================
function updateEscrowByRole() {
  const isShipper = currentRole === 'shipper';
  const feePct = systemConfig.platformFeePercent;
  const net = Math.round(activePrice * (1 - feePct / 100)).toLocaleString('vi-VN');
  document.getElementById('escrowDisplayAmount').textContent = activePrice.toLocaleString('vi-VN') + " VNĐ";
  const controls = document.getElementById('escrowRoleControls');

  if (!isEscrowFunded) {
    controls.innerHTML = isShipper
      ? `<button onclick="fundEscrowNow()" class="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition"><i class="fa-solid fa-lock mr-1"></i> Chủ hàng: Nạp ${activePrice.toLocaleString('vi-VN')} đ vào Ví Escrow</button>`
      : `<div class="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs text-center font-semibold">Đang chờ Chủ hàng nạp tiền ký quỹ vào Ví Escrow. Sau khi tiền được khóa, xe của bạn mới bắt đầu di chuyển.</div>`;
  } else {
    controls.innerHTML = `
      <div class="flex flex-col sm:flex-row gap-2">
        <button onclick="switchTab('tracking')" class="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition"><i class="fa-solid fa-location-crosshairs mr-1"></i> Xem bản đồ Theo dõi đơn</button>
        <button onclick="signEPOD()" id="btnEPOD" class="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-emerald-700 transition"><i class="fa-solid fa-file-signature mr-1"></i> ${isShipper ? 'Ký nhận hàng e-POD & Giải ngân' : 'Xác nhận đã giao & Nhận ' + net + 'đ'}</button>
      </div>
      <div id="payoutSuccessBox" class="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold hidden text-center">
        🎉 Đã giải ngân thành công ${net} VNĐ về Ví Nhà xe (Đã khấu trừ ${feePct}% phí dịch vụ TruckM4te).
      </div>
    `;
  }
}

function fundEscrowNow() {
  isEscrowFunded = true;
  alert(`Đã nạp ${activePrice.toLocaleString('vi-VN')} VNĐ vào Ví ký quỹ Escrow thành công!`);
  updateEscrowByRole();
}

function signEPOD() {
  document.getElementById('step3-badge').className = "w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mt-0.5";
  document.getElementById('payoutSuccessBox').classList.remove('hidden');
  const btn = document.getElementById('btnEPOD');
  btn.disabled = true;
  btn.classList.add('opacity-50', 'cursor-not-allowed');
}

// ==========================================
// 7. TÍNH NĂNG THEO DÕI ĐƠN HÀNG & BẢN ĐỒ GPS TRỰC TIẾP
// ==========================================
function renderTrackingView() {
  const isShipper = currentRole === 'shipper';
  const listEl = document.getElementById('trackingOrderList');
  listEl.innerHTML = '';

  trackingList.forEach(order => {
    const active = order.code === selectedTrackingId;
    listEl.innerHTML += `
      <div onclick="selectTracking('${order.code}')" class="cursor-pointer p-4 rounded-2xl border transition ${
        active ? 'bg-emerald-50/70 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-300'
      }">
        <div class="flex justify-between items-center mb-1">
          <span class="font-mono font-black text-xs text-emerald-800">#${order.code}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
            order.progress === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
          }">${order.progress === 100 ? 'Hoàn tất' : 'Đang chạy (' + order.progress + '%)'}</span>
        </div>
        <p class="font-extrabold text-sm text-slate-900">${order.route}</p>
        <p class="text-[11px] font-semibold text-emerald-700 mt-1"><i class="fa-solid fa-location-dot mr-1"></i> ${order.province}</p>
      </div>
    `;
  });

  const order = trackingList.find(o => o.code === selectedTrackingId) || trackingList[0];
  let stepsHtml = '';
  order.steps.forEach(st => {
    stepsHtml += `
      <div class="relative pl-6 pb-5 border-l-2 ${st.done ? 'border-emerald-500' : 'border-slate-200'} last:pb-0">
        <span class="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
          st.current ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : (st.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500')
        }">${st.done ? '<i class="fa-solid fa-check"></i>' : ''}</span>
        <div class="flex justify-between items-center">
          <h5 class="text-xs font-extrabold ${st.done ? 'text-slate-900' : 'text-slate-400'}">${st.title}</h5>
          <span class="text-[11px] font-mono font-bold text-emerald-700">${st.time}</span>
        </div>
        <p class="text-[11px] text-slate-500 mt-0.5">${st.desc}</p>
      </div>
    `;
  });

  document.getElementById('trackingDetailPanel').innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-mono font-black text-base text-emerald-700">#${order.code}</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">${order.escrowStatus}</span>
        </div>
        <h3 class="text-lg font-black text-slate-900 mt-1">${order.route} · ${order.cargo}</h3>
      </div>
      <div class="sm:text-right">
        <span class="text-[10px] uppercase font-bold text-slate-400 block">Giá cước hợp đồng</span>
        <span class="text-base font-black text-slate-900">${order.price}</span>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl text-xs">
        <div class="flex items-center gap-2 font-bold text-emerald-900">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
          <span>Khu vực hiện tại: <span class="underline">${order.province}</span></span>
        </div>
        <span class="text-[11px] text-emerald-700 font-semibold">Biển số: <b>${order.plate}</b></span>
      </div>

      <div id="liveOrderMap" class="w-full h-64 sm:h-72 rounded-2xl border border-slate-300 overflow-hidden shadow-inner"></div>
    </div>

    <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
      <div class="flex justify-between items-center text-xs font-bold">
        <span class="text-emerald-700"><i class="fa-solid fa-truck-moving mr-1"></i> ${order.location}</span>
        <span>${order.progress}%</span>
      </div>
      <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
        <div class="bg-emerald-600 h-full rounded-full transition-all duration-500" style="width: ${order.progress}%"></div>
      </div>
      <div class="flex justify-between text-[11px] text-slate-500 pt-1">
        <span>Chủ hàng: <b>${order.shipper}</b></span>
        <span>${order.eta}</span>
      </div>
    </div>

    <div>
      <h4 class="text-xs font-extrabold uppercase text-slate-500 mb-4">Tiến trình giao nhận thực tế</h4>
      <div class="ml-2">${stepsHtml}</div>
    </div>

    ${order.progress < 100 ? `
      <div class="pt-3 border-t border-slate-100 flex justify-end">
        <button onclick="finishOrderTracking('${order.code}')" class="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition">
          ${isShipper ? 'Xác nhận nhận hàng & Ký e-POD' : 'Cập nhật: Đã giao hàng tới nơi'}
        </button>
      </div>
    ` : ''}
  `;

  setTimeout(() => initOrderMap(order), 50);
}

function initOrderMap(order) {
  const mapEl = document.getElementById('liveOrderMap');
  if (!mapEl || typeof L === 'undefined') return;

  if (trackingMapInstance) {
    trackingMapInstance.remove();
    trackingMapInstance = null;
  }

  trackingMapInstance = L.map('liveOrderMap').setView(order.coords.current, 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(trackingMapInstance);

  L.circleMarker(order.coords.origin, {
    radius: 7,
    fillColor: "#0f172a",
    color: "#ffffff",
    weight: 2,
    fillOpacity: 1
  }).addTo(trackingMapInstance).bindPopup(`<b>Điểm xuất phát:</b> ${order.route.split('➔')[0].trim()}`);

  L.circleMarker(order.coords.dest, {
    radius: 7,
    fillColor: "#dc2626",
    color: "#ffffff",
    weight: 2,
    fillOpacity: 1
  }).addTo(trackingMapInstance).bindPopup(`<b>Điểm trả hàng:</b> ${order.route.split('➔')[1].trim()}`);

  L.polyline([order.coords.origin, order.coords.current], {
    color: '#059669',
    weight: 4
  }).addTo(trackingMapInstance);

  L.polyline([order.coords.current, order.coords.dest], {
    color: '#10b981',
    weight: 3,
    dashArray: '8, 8'
  }).addTo(trackingMapInstance);

  const truckIcon = L.divIcon({
    className: 'truck-gps-marker',
    html: '<i class="fa-solid fa-truck text-xs"></i>',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const truckMarker = L.marker(order.coords.current, { icon: truckIcon }).addTo(trackingMapInstance);
  truckMarker.bindPopup(`
    <div style="font-size:12px; line-height:1.4;">
      <b style="color:#047857;">Đơn #${order.code} (${order.plate})</b><br/>
      <b>Vùng hiện tại:</b> ${order.province}<br/>
      <span>${order.location}</span>
    </div>
  `).openPopup();

  const bounds = L.latLngBounds([order.coords.origin, order.coords.current, order.coords.dest]);
  trackingMapInstance.fitBounds(bounds, { padding: [35, 35] });
}

function selectTracking(code) {
  selectedTrackingId = code;
  renderTrackingView();
}

function searchTrackingOrder() {
  const q = document.getElementById('trackingSearchInput').value.trim().toUpperCase().replace('#', '');
  const found = trackingList.find(o => o.code.includes(q));
  if (found) {
    selectedTrackingId = found.code;
    renderTrackingView();
  } else {
    alert("Không tìm thấy mã đơn này! Thử nhập: TM-801, TM-802 hoặc TM-803.");
  }
}

function finishOrderTracking(code) {
  const order = trackingList.find(o => o.code === code);
  if (order) {
    order.progress = 100;
    order.coords.current = order.coords.dest;
    order.province = "Đã đến điểm trả hàng: " + order.route.split('➔')[1].trim();
    order.location = "Đã giao hàng thành công tại điểm trả";
    order.eta = "Hoàn tất vừa xong";
    order.escrowStatus = "Đã ký e-POD & Giải ngân tự động";
    order.steps.forEach(s => { s.done = true; s.current = false; });
    order.steps[order.steps.length - 1].current = true;
    order.steps[order.steps.length - 1].time = "Vừa xong";
    saveDatabase();
    renderTrackingView();
    alert("Đã cập nhật giao hàng thành công, di chuyển xe về đích trên bản đồ và giải ngân tự động qua e-POD!");
  }
}

// ==========================================
// 8. BẢNG ĐIỀU KHIỂN THEO VAI TRÒ
// ==========================================
function updateDashboardByRole() {
  const isShipper = currentRole === 'shipper';
  document.getElementById('dashboardTitle').textContent = isShipper ? "Bảng điều khiển Chủ hàng" : "Bảng điều khiển Nhà xe";
  document.getElementById('dashboardSub').textContent = isShipper
    ? "Tổng hợp đơn hàng gửi chiều về và chi phí logistics đã tiết kiệm."
    : "Tổng hợp doanh thu tăng thêm từ chiều quay đầu và số dư giải ngân.";
  document.getElementById('dashboardRolePill').textContent = isShipper ? "Vai trò: Chủ hàng (Shipper)" : "Vai trò: Nhà xe (Carrier)";

  document.getElementById('dashboardStatsGrid').innerHTML = isShipper
    ? `
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><span class="text-xs text-slate-400 font-bold uppercase">Đơn hàng đang xử lý</span><div class="text-2xl font-black text-slate-800 mt-1">14 đơn</div><span class="text-xs text-emerald-600 font-bold">+4 đơn mới hôm nay</span></div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><span class="text-xs text-slate-400 font-bold uppercase">Chi phí cước tiết kiệm</span><div class="text-2xl font-black text-emerald-700 mt-1">24.600.000 đ</div><span class="text-xs text-slate-400">Giảm 28.5% so với thuê nguyên chuyến</span></div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><span class="text-xs text-slate-400 font-bold uppercase">Tỷ lệ ghép thành công</span><div class="text-2xl font-black text-slate-800 mt-1">92.4%</div><span class="text-xs text-emerald-600 font-bold">Thời gian khớp TB 18 phút</span></div>
    `
    : `
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><span class="text-xs text-slate-400 font-bold uppercase">Chuyến chiều về đã ghép</span><div class="text-2xl font-black text-slate-800 mt-1">32 chuyến</div><span class="text-xs text-emerald-600 font-bold">Giảm tỷ lệ chạy rỗng còn 14%</span></div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><span class="text-xs text-slate-400 font-bold uppercase">Doanh thu thuần tăng thêm</span><div class="text-2xl font-black text-emerald-700 mt-1">+86.400.000 đ</div><span class="text-xs text-slate-400">+22.5% lợi nhuận ròng đội xe</span></div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><span class="text-xs text-slate-400 font-bold uppercase">Số dư Ví giải ngân</span><div class="text-2xl font-black text-slate-800 mt-1">19.250.000 đ</div><span class="text-xs text-emerald-600 font-bold">Sẵn sàng rút về ngân hàng</span></div>
    `;

  let rowsHtml = '';
  trackingList.forEach(item => {
    rowsHtml += `
      <tr>
        <td class="p-3 font-mono font-bold">#${item.code}</td>
        <td class="p-3 font-semibold">${item.route}</td>
        <td class="p-3">${item.cargo}</td>
        <td class="p-3 font-bold text-emerald-700">${item.price}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded ${item.progress === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'} font-bold">${item.escrowStatus}</span></td>
        <td class="p-3"><button onclick="selectTracking('${item.code}'); switchTab('tracking');" class="text-emerald-700 font-bold underline">Xem bản đồ GPS</button></td>
      </tr>
    `;
  });
  document.getElementById('dashboardTableBody').innerHTML = rowsHtml;
}

// ==========================================
// 9. TRANG QUẢN TRỊ ADMIN (QUẢN LÝ TOÀN BỘ WEBSITE)
// ==========================================
function switchAdminSubTab(subTab) {
  document.querySelectorAll('.adm-sub-panel').forEach(p => {
    p.classList.add('hidden');
    p.classList.remove('block');
  });
  document.getElementById(`adm-panel-${subTab}`).classList.remove('hidden');
  document.getElementById(`adm-panel-${subTab}`).classList.add('block');

  document.querySelectorAll('.adm-sub-btn').forEach(b => {
    b.className = "adm-sub-btn px-4 py-2 rounded-xl text-xs font-extrabold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition";
  });
  document.getElementById(`adm-tab-${subTab}`).className = "adm-sub-btn px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 text-white transition";
}

function renderAdminDashboard() {
  const totalPosts = emptyTruckTrips.length + shipperOrders.length;
  const totalEscrowValue = trackingList.reduce((acc, item) => acc + (item.rawPrice || 3400000), 0);
  const totalPlatformFee = Math.round(totalEscrowValue * (systemConfig.platformFeePercent / 100));

  document.getElementById('adminKpiCards').innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-[11px] text-slate-400 font-bold uppercase">Tổng tài khoản User</span>
      <div class="text-2xl font-black text-slate-900 mt-1">${usersDB.length} tài khoản</div>
      <span class="text-xs text-emerald-600 font-bold">Chủ hàng, Nhà xe & Admin</span>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-[11px] text-slate-400 font-bold uppercase">Tổng tin đăng trên sàn</span>
      <div class="text-2xl font-black text-emerald-700 mt-1">${totalPosts} tin đăng</div>
      <span class="text-xs text-slate-500">${emptyTruckTrips.length} xe rỗng · ${shipperOrders.length} đơn hàng</span>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-[11px] text-slate-400 font-bold uppercase">Tổng dòng tiền Ví Escrow</span>
      <div class="text-2xl font-black text-blue-700 mt-1">${totalEscrowValue.toLocaleString('vi-VN')} đ</div>
      <span class="text-xs text-blue-600 font-bold">${trackingList.length} hợp đồng vận chuyển</span>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-[11px] text-slate-400 font-bold uppercase">Doanh thu Phí sàn (${systemConfig.platformFeePercent}%)</span>
      <div class="text-2xl font-black text-amber-600 mt-1">${totalPlatformFee.toLocaleString('vi-VN')} đ</div>
      <span class="text-xs text-emerald-600 font-bold">Khấu trừ tự động qua e-POD</span>
    </div>
  `;

  // 1. Bảng quản lý Tin đăng
  const postsTbody = document.getElementById('adminPostsTableBody');
  postsTbody.innerHTML = '';

  emptyTruckTrips.forEach(t => {
    postsTbody.innerHTML += `
      <tr>
        <td class="p-3 font-mono font-bold">#TRK-${t.id}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">🚛 Xe rỗng chiều về</span></td>
        <td class="p-3 font-bold text-slate-800">${t.partner}</td>
        <td class="p-3">${t.origin} ➔ ${t.dest}</td>
        <td class="p-3">${t.cargo} (${t.weight}T - ${t.type})</td>
        <td class="p-3 font-bold text-emerald-700">${t.price.toLocaleString('vi-VN')} đ</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Đã duyệt hiển thị</span></td>
        <td class="p-3 text-right">
          <button onclick="adminDeletePost('truck', ${t.id})" class="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100">Xóa tin</button>
        </td>
      </tr>
    `;
  });

  shipperOrders.forEach(o => {
    postsTbody.innerHTML += `
      <tr>
        <td class="p-3 font-mono font-bold">#ORD-${o.id}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">📦 Đơn cần gửi hàng</span></td>
        <td class="p-3 font-bold text-slate-800">${o.partner}</td>
        <td class="p-3">${o.origin} ➔ ${o.dest}</td>
        <td class="p-3">${o.cargo} (${o.weight}T - ${o.type})</td>
        <td class="p-3 font-bold text-emerald-700">${o.price.toLocaleString('vi-VN')} đ</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Đã duyệt hiển thị</span></td>
        <td class="p-3 text-right">
          <button onclick="adminDeletePost('order', ${o.id})" class="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100">Xóa tin</button>
        </td>
      </tr>
    `;
  });

  // 2. Bảng quản lý Người dùng
  const usersTbody = document.getElementById('adminUsersTableBody');
  usersTbody.innerHTML = '';
  usersDB.forEach(u => {
    usersTbody.innerHTML += `
      <tr>
        <td class="p-3 font-mono font-bold">#USR-${u.id}</td>
        <td class="p-3 font-bold text-slate-800">${u.fullName}<div class="text-[10px] text-slate-400 font-normal">${u.extraInfo || ''}</div></td>
        <td class="p-3">${u.email}</td>
        <td class="p-3">${u.phone}</td>
        <td class="p-3 uppercase font-extrabold text-[10px] ${u.role === 'admin' ? 'text-amber-700' : (u.role === 'shipper' ? 'text-emerald-700' : 'text-blue-700')}">${u.role}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded ${u.status === 'Hoạt động' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} font-bold">${u.status}</span></td>
        <td class="p-3 text-right space-x-1">
          ${u.role !== 'admin' ? `
            <button onclick="adminToggleUserStatus(${u.id})" class="px-2.5 py-1 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700">${u.status === 'Hoạt động' ? 'Khóa' : 'Mở khóa'}</button>
            <button onclick="adminDeleteUser(${u.id})" class="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100">Xóa</button>
          ` : '<span class="text-slate-400 italic">Quản trị gốc</span>'}
        </td>
      </tr>
    `;
  });

  // 3. Bảng quản lý Ký quỹ Escrow
  const escrowTbody = document.getElementById('adminEscrowTableBody');
  escrowTbody.innerHTML = '';
  trackingList.forEach(tr => {
    const raw = tr.rawPrice || 3400000;
    const fee = Math.round(raw * (systemConfig.platformFeePercent / 100));
    escrowTbody.innerHTML += `
      <tr>
        <td class="p-3 font-mono font-bold">#${tr.code}</td>
        <td class="p-3 font-semibold">${tr.route}</td>
        <td class="p-3"><div><b>Gửi:</b> ${tr.shipper}</div><div class="text-slate-500"><b>Xe:</b> ${tr.plate}</div></td>
        <td class="p-3 font-bold text-slate-900">${raw.toLocaleString('vi-VN')} đ</td>
        <td class="p-3 font-bold text-emerald-700">+${fee.toLocaleString('vi-VN')} đ</td>
        <td class="p-3">${tr.progress}% (${tr.province})</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded ${tr.progress === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'} font-bold">${tr.escrowStatus}</span></td>
        <td class="p-3 text-right">
          ${tr.progress < 100
            ? `<button onclick="finishOrderTracking('${tr.code}'); renderAdminDashboard();" class="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Duyệt giải ngân e-POD</button>`
            : `<span class="text-emerald-700 font-bold"><i class="fa-solid fa-check-double"></i> Đã tất toán</span>`
          }
        </td>
      </tr>
    `;
  });
}

function adminDeletePost(type, id) {
  if (!confirm("Bạn có chắc chắn muốn xóa tin đăng này khỏi sàn giao dịch?")) return;
  if (type === 'truck') {
    emptyTruckTrips = emptyTruckTrips.filter(x => x.id !== id);
  } else {
    shipperOrders = shipperOrders.filter(x => x.id !== id);
  }
  saveDatabase();
  renderAdminDashboard();
  renderMarketCards(currentRole === 'shipper' ? emptyTruckTrips : shipperOrders);
}

function adminToggleUserStatus(userId) {
  const user = usersDB.find(u => u.id === userId);
  if (user) {
    user.status = user.status === "Hoạt động" ? "Đã khóa" : "Hoạt động";
    saveDatabase();
    renderAdminDashboard();
  }
}

function adminDeleteUser(userId) {
  if (!confirm("Xóa vĩnh viễn tài khoản người dùng này?")) return;
  usersDB = usersDB.filter(u => u.id !== userId);
  saveDatabase();
  renderAdminDashboard();
}

function saveAdminSettings(e) {
  e.preventDefault();
  systemConfig.platformFeePercent = parseFloat(document.getElementById('cfgPlatformFee').value) || 4;
  systemConfig.basePricePerTon = parseInt(document.getElementById('cfgBasePricePerTon').value) || 520000;
  systemConfig.maxDeviationPercent = parseFloat(document.getElementById('cfgMaxDeviation').value) || 10;
  alert(`Đã cập nhật cấu hình hệ thống! Phí sàn hiện tại: ${systemConfig.platformFeePercent}%`);
  renderAdminDashboard();
  updateBiddingByRole();
  updateEscrowByRole();
}

function resetDatabaseToDefault() {
  if (!confirm("Khôi phục toàn bộ dữ liệu Website về trạng thái mẫu ban đầu?")) return;
  localStorage.clear();
  emptyTruckTrips = JSON.parse(JSON.stringify(defaultEmptyTruckTrips));
  shipperOrders = JSON.parse(JSON.stringify(defaultShipperOrders));
  usersDB = JSON.parse(JSON.stringify(defaultUsersDB));
  trackingList = JSON.parse(JSON.stringify(defaultTrackingList));
  saveDatabase();
  renderAdminDashboard();
  renderMarketCards(currentRole === 'shipper' ? emptyTruckTrips : shipperOrders);
  alert("Đã khôi phục Database mặc định thành công!");
}

function exportDatabaseJSON() {
  const fullDB = {
    users: usersDB,
    emptyTruckTrips: emptyTruckTrips,
    shipperOrders: shipperOrders,
    escrowTrackingContracts: trackingList,
    systemConfig: systemConfig
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullDB, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "truckm4te_database_backup.json");
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
}

// ==========================================
// 10. AI COPILOT & BỘ PHÂN TÍCH NGÔN NGỮ TỰ NHIÊN DÙNG CHUNG
// ==========================================
const copilotMicBtn = document.getElementById('copilotMicBtn');
const copilotInput = document.getElementById('copilotInput');
const copilotMicNote = document.getElementById('copilotMicNote');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognizer = new SpeechRecognition();
  recognizer.lang = 'vi-VN';
  let recording = false;

  copilotMicBtn.addEventListener('click', () => {
    if (!recording) {
      recognizer.start();
      copilotMicBtn.classList.add('mic-active');
      copilotMicNote.textContent = 'Đang lắng nghe giọng nói của bạn...';
      recording = true;
    } else {
      recognizer.stop();
    }
  });

  recognizer.onresult = (e) => {
    copilotInput.value = e.results[0][0].transcript;
    copilotMicNote.textContent = 'Đã nhận dạng xong giọng nói!';
    executeCopilotNLP();
  };

  recognizer.onend = () => {
    copilotMicBtn.classList.remove('mic-active');
    recording = false;
  };
}

function formatPlaceName(str) {
  return str
    .trim()
    .replace(/\b(kcn)\b/gi, "KCN")
    .replace(/\b(ccn)\b/gi, "CCN")
    .replace(/\b(tp|tp\.)\b/gi, "TP.")
    .replace(/\b(ql1a)\b/gi, "QL1A")
    .replace(/\b(vsip)\b/gi, "VSIP")
    .replace(/(^\w|\s\w)/g, m => m.toUpperCase());
}

function parseLogisticsText(rawText) {
  const val = rawText.toLowerCase();

  // 1. Tải trọng
  let weightNum = 6.0;
  const matchTon = val.match(/(\d+(?:[.,]\d+)?)\s*(tấn|tan|t\b)/i);
  const matchKg = val.match(/(\d+(?:[.,]\d+)?)\s*(kg|ký|ki-lô)/i);
  if (matchTon) weightNum = parseFloat(matchTon[1].replace(',', '.'));
  else if (matchKg) weightNum = parseFloat((parseFloat(matchKg[1].replace(',', '.')) / 1000).toFixed(1));

  // 2. Loại thùng xe
  let type = "Thùng bạt";
  if (val.includes("thùng kín") || val.includes("xe kín") || val.includes("kín")) type = "Thùng kín";
  else if (val.includes("đông lạnh") || val.includes("xe lạnh") || val.includes("cấp đông") || val.includes("bảo ôn")) type = "Đông lạnh";

  // 3. Điểm xuất phát & Điểm đến (kèm vị trí cụ thể như KCN, cảng, quận/huyện)
  let origin = "Đà Nẵng";
  let dest = "Quy Nhơn";
  const routePattern = /(?:từ|ở|tại|xuất phát từ|rời|lấy hàng ở|bốc ở)\s+(.+?)\s+(?:đi|về|đến|ra|vào|tới|sang|qua|giao ở|trả ở)\s+(.+?)(?=\s+(?:chiều|sáng|tối|đêm|mai|hôm nay|ngày|lúc|bằng|xe|nhận|chở|gửi|cần|giá|với|tải trọng|\d+\s*tấn)|[.,;]|$)/i;
  const routeMatch = rawText.match(routePattern);

  if (routeMatch) {
    origin = formatPlaceName(routeMatch[1].replace(/^(?:ở|tại|khu vực)\s+/i, ''));
    dest = formatPlaceName(routeMatch[2].replace(/^(?:ở|tại|khu vực)\s+/i, ''));
  } else {
    const locationsList = [
      "kcn hòa khánh", "kcn hòa cầm", "kcn liên chiểu", "kcn tịnh phong", "kcn dung quất", "kcn chu lai",
      "kcn phú tài", "kcn nhơn hội", "kcn sóng thần", "kcn vsip", "kcn ngọc hồi", "kcn bắc thăng long",
      "cảng tiên sa", "cảng quy nhơn", "cảng cát lái", "cảng hải phòng", "cảng đà nẵng",
      "đà nẵng", "hòa vang", "liên chiểu", "sơn trà", "hải châu", "cẩm lệ", "ngũ hành sơn",
      "quảng nam", "tam kỳ", "hội an", "núi thành", "điện bàn", "đại lộc",
      "quảng ngãi", "đức phổ", "sa huỳnh", "bình sơn",
      "quy nhơn", "bình định", "an nhơn", "phù mỹ", "hoài nhơn",
      "huế", "thừa thiên huế", "phú lộc", "quảng trị", "đông hà", "quảng bình", "đồng hới",
      "hà tĩnh", "nghệ an", "vinh", "thanh hóa",
      "hà nội", "hải phòng", "bắc ninh", "hưng yên", "hải dương", "quảng ninh", "hạ long", "nam định",
      "phú yên", "tuy hòa", "khánh hòa", "nha trang", "cam ranh", "ninh thuận", "bình thuận", "phan thiết",
      "gia lai", "pleiku", "kon tum", "đắk lắk", "buôn ma thuột", "lâm đồng", "đà lạt",
      "tp. hồ chí minh", "hồ chí minh", "sài gòn", "thủ đức", "bình dương", "đồng nai", "biên hòa",
      "bà rịa", "vũng tàu", "long an", "tiền giang", "cần thơ", "miền tây"
    ];

    let foundPlaces = [];
    locationsList.forEach(loc => {
      const idx = val.indexOf(loc);
      if (idx !== -1) foundPlaces.push({ name: formatPlaceName(loc), index: idx, len: loc.length });
    });

    foundPlaces.sort((a, b) => a.index - b.index || b.len - a.len);
    let distinctPlaces = [];
    foundPlaces.forEach(p => {
      if (!distinctPlaces.some(d => Math.abs(d.index - p.index) < 5)) {
        distinctPlaces.push(p);
      }
    });

    if (distinctPlaces.length >= 2) {
      origin = distinctPlaces[0].name;
      dest = distinctPlaces[1].name;
    } else if (distinctPlaces.length === 1) {
      const beforeWord = val.substring(0, distinctPlaces[0].index);
      if (/(?:đi|về|đến|ra|vào|tới)\s*$/.test(beforeWord)) {
        dest = distinctPlaces[0].name;
      } else {
        origin = distinctPlaces[0].name;
      }
    }
  }

  // 4. Loại mặt hàng
  let cargo = "Hàng bách hóa";
  const cargoKeywords = [
    { keys: ["nông sản", "lúa", "gạo", "ngô", "sắn", "khoai", "hạt điều", "cà phê", "tiêu", "rau củ"], label: "Nông sản" },
    { keys: ["trái cây", "hoa quả", "sầu riêng", "thanh long", "dưa hấu", "xoài", "chuối", "vải"], label: "Trái cây tươi" },
    { keys: ["hải sản", "thủy sản", "cá", "tôm", "mực", "thịt", "thực phẩm đông lạnh"], label: "Thực phẩm / Hải sản" },
    { keys: ["bao bì", "carton", "giấy", "nhựa", "thùng xốp", "pallet"], label: "Bao bì / Carton" },
    { keys: ["xi măng", "sắt", "thép", "gạch", "đá", "cát", "vật liệu xây dựng", "vlxd", "sơn"], label: "Vật liệu xây dựng" },
    { keys: ["gỗ", "nội thất", "bàn ghế", "ván ép", "dăm gỗ", "viên nén"], label: "Gỗ & Nội thất" },
    { keys: ["điện tử", "linh kiện", "máy móc", "thiết bị", "phụ tùng"], label: "Máy móc / Thiết bị" },
    { keys: ["phân bón", "thức ăn chăn nuôi", "cám", "hóa chất"], label: "Phân bón / Thức ăn CN" },
    { keys: ["tiêu dùng", "tạp hóa", "nước ngọt", "bia", "sữa", "bánh kẹo", "hàng khô"], label: "Hàng tiêu dùng / Hàng khô" },
    { keys: ["vải", "may mặc", "quần áo", "giày dép"], label: "Hàng may mặc" }
  ];

  let matchedCargo = false;
  for (const item of cargoKeywords) {
    for (const k of item.keys) {
      if (val.includes(k)) {
        cargo = item.label;
        matchedCargo = true;
        break;
      }
    }
    if (matchedCargo) break;
  }

  if (!matchedCargo) {
    const dynCargoMatch = rawText.match(/(?:\d+\s*(?:tấn|tạ|kg)|chở|gửi|nhận ghép|nhận chở|mặt hàng|hàng)\s+([a-zA-ZÀ-ỹ0-9\s]{2,25}?)(?=\s+(?:từ|ở|tại|đi|về|đến|ra|vào|bằng|xe|chiều|sáng|tối|mai|hôm nay)|[.,;]|$)/i);
    if (dynCargoMatch && dynCargoMatch[1]) {
      const candidate = dynCargoMatch[1].trim();
      if (!/^(rỗng|trống|chiều về|quay đầu)$/i.test(candidate)) {
        cargo = candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    } else if (val.includes("rỗng") || val.includes("xe trống")) {
      cargo = "Nhận ghép mọi mặt hàng";
    }
  }

  const minPrice = Math.round((weightNum * systemConfig.basePricePerTon) / 100000) * 100000;
  const maxPrice = minPrice + 500000;

  return { origin, dest, cargo, weightNum, type, minPrice, maxPrice };
}

function executeCopilotNLP() {
  const rawText = copilotInput.value.trim();
  if (!rawText) return;
  const parsed = parseLogisticsText(rawText);

  document.getElementById('out-origin').textContent = parsed.origin;
  document.getElementById('out-dest').textContent = parsed.dest;
  document.getElementById('out-cargo').textContent = parsed.cargo;
  document.getElementById('out-weight').textContent = parsed.weightNum + " Tấn";
  document.getElementById('out-type').textContent = parsed.type;
  const benchEl = document.getElementById('out-benchmark');
  if (benchEl) {
    benchEl.textContent = `${parsed.minPrice.toLocaleString('vi-VN')}đ – ${parsed.maxPrice.toLocaleString('vi-VN')}đ`;
  }
}

function pushCopilotToMarket() {
  executeCopilotNLP();
  const origin = document.getElementById('out-origin').textContent;
  const dest = document.getElementById('out-dest').textContent;
  const cargo = document.getElementById('out-cargo').textContent;
  const weightNum = parseFloat(document.getElementById('out-weight').textContent) || 6.0;
  const type = document.getElementById('out-type').textContent;
  const suggestedPrice = Math.round((weightNum * 550000) / 100000) * 100000;

  const partnerName = currentUser ? currentUser.fullName : (currentRole === 'shipper' ? `Đơn AI Copilot (${cargo})` : `Xe AI Copilot (${cargo})`);

  const newItem = {
    id: Date.now(),
    partner: partnerName,
    origin: origin,
    dest: dest,
    cargo: cargo,
    weight: weightNum,
    type: type,
    deviation: "3.0%",
    match: 97,
    price: suggestedPrice,
    time: "Vừa tạo qua AI Copilot",
    approved: true
  };

  if (currentRole === 'shipper') shipperOrders.unshift(newItem);
  else emptyTruckTrips.unshift(newItem);

  saveDatabase();
  alert(`Đã chuẩn hóa và đẩy lên sàn!\n• Tuyến: ${origin} ➔ ${dest}\n• Mặt hàng: ${cargo}\n• Tải trọng: ${weightNum} Tấn (${type})`);
  switchTab('market');
}

// ==========================================
// 11. TÍCH HỢP AI COPILOT TRỰC TIẾP TRONG MODAL ĐĂNG TIN
// ==========================================
function autoFillModalWithAI() {
  const rawText = document.getElementById('modalAiInput').value.trim();
  if (!rawText) return;

  const parsed = parseLogisticsText(rawText);

  document.getElementById('postOrigin').value = parsed.origin;
  document.getElementById('postDest').value = parsed.dest;
  document.getElementById('postCargo').value = parsed.cargo;
  document.getElementById('postWeight').value = parsed.weightNum;
  document.getElementById('postType').value = parsed.type;
  document.getElementById('postPrice').value = parsed.minPrice;

  const partnerInput = document.getElementById('postDriver');
  if (!partnerInput.value) {
    partnerInput.value = currentUser ? currentUser.fullName : (currentRole === 'shipper' ? "Chủ hàng (Tạo nhanh qua AI)" : "Nhà xe (Báo rỗng qua AI)");
  }

  document.getElementById('modalBenchmarkHint').innerHTML = `Khung giá AI gợi ý: <b class="text-emerald-700">${parsed.minPrice.toLocaleString('vi-VN')}đ – ${parsed.maxPrice.toLocaleString('vi-VN')}đ</b>`;
}

let modalRecording = false;
function toggleModalVoice() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    alert("Trình duyệt không hỗ trợ nhận diện giọng nói (Hãy dùng Chrome hoặc Cốc Cốc / Edge).");
    return;
  }
  const rec = new SpeechRec();
  rec.lang = 'vi-VN';
  const micBtn = document.getElementById('modalMicBtn');
  const statusEl = document.getElementById('modalMicStatus');

  if (!modalRecording) {
    rec.start();
    micBtn.classList.add('mic-active');
    statusEl.textContent = "Đang nghe bạn nói...";
    modalRecording = true;

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      document.getElementById('modalAiInput').value = transcript;
      statusEl.textContent = "Đã tự động điền form bằng AI!";
      autoFillModalWithAI();
    };
    rec.onend = () => {
      micBtn.classList.remove('mic-active');
      modalRecording = false;
    };
  }
}

function openModalPost() {
  const isShipper = currentRole === 'shipper';
  document.getElementById('modalTitle').textContent = isShipper ? "Đăng đơn cần gửi hàng" : "Đăng chuyến xe rỗng chiều về";
  document.getElementById('modalPartnerLabel').textContent = isShipper ? "Tên doanh nghiệp / Chủ hàng" : "Tên đối tác / Nhà xe";
  document.getElementById('modalWeightLabel').textContent = isShipper ? "Khối lượng (Tấn)" : "Tải trống (Tấn)";
  if (currentUser) {
    document.getElementById('postDriver').value = currentUser.fullName;
  }
  document.getElementById('modalAiInput').placeholder = isShipper
    ? "VD: Cần gửi 6 tấn nông sản từ KCN Hòa Khánh Đà Nẵng đi Cảng Quy Nhơn chiều nay bằng xe thùng bạt..."
    : "VD: Xe 8 tấn thùng kín rỗng từ Tam Kỳ Quảng Nam về Quy Nhơn chiều nay nhận ghép bao bì...";
  document.getElementById('modalPost').classList.remove('hidden');
}

function closeModalPost() {
  document.getElementById('modalPost').classList.add('hidden');
}

document.getElementById('formNewPost').addEventListener('submit', (e) => {
  e.preventDefault();
  const isShipper = currentRole === 'shipper';
  const newTrip = {
    id: Date.now(),
    partner: document.getElementById('postDriver').value,
    origin: document.getElementById('postOrigin').value,
    dest: document.getElementById('postDest').value,
    cargo: document.getElementById('postCargo').value || "Hàng tổng hợp",
    weight: parseFloat(document.getElementById('postWeight').value),
    type: document.getElementById('postType').value,
    deviation: "3.2%",
    match: 97,
    price: parseInt(document.getElementById('postPrice').value),
    time: "Vừa mới đăng (AI Copilot)",
    approved: true
  };

  if (isShipper) {
    shipperOrders.unshift(newTrip);
    alert("Đã đăng đơn gửi hàng! Khi bấm chuyển sang nút 'Nhà xe', đơn này sẽ xuất hiện để tài xế nhận ghép.");
  } else {
    emptyTruckTrips.unshift(newTrip);
    alert("Đã đăng chuyến xe rỗng! Khi bấm chuyển sang nút 'Chủ hàng', xe này sẽ xuất hiện để chủ hàng đặt xe.");
  }

  saveDatabase();
  renderMarketCards(isShipper ? emptyTruckTrips : shipperOrders);
  closeModalPost();
  document.getElementById('formNewPost').reset();
  document.getElementById('modalAiInput').value = '';
});

// Khởi chạy ứng dụng & khôi phục phiên đăng nhập nếu có
const savedSession = localStorage.getItem('tm4_currentUser');
if (savedSession) {
  currentUser = JSON.parse(savedSession);
  updateAuthHeaderUI();
}
changeRole('shipper');