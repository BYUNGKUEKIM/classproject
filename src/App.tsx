import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Users,
  MessageSquare,
  Camera,
  Plus,
  Search,
  Clock,
  CreditCard,
  DollarSign,
} from 'lucide-react';

// --- 타입 정의 ---
interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  totalVisits: number;
  notes: string;
  category: string;
  totalCost: number;
  deposit: number;
  paymentMethod: string;
  depositMethod: string;
}

interface Appointment {
  id: number;
  customerName: string;
  date: string;
  time: string;
  service: string;
  status: string;
  notes: string;
}

interface User {
  id: string;
  username: string;
  password?: string;
  email: string;
  phone: string;
  studioName: string;
  createdAt: string;
  profile_image: string;
}

interface NewCustomer {
  name: string;
  phone: string;
  email: string;
  category: string;
  notes: string;
  totalCost: string;
  deposit: string;
  paymentMethod: string;
  depositMethod: string;
}

interface NewAppointment {
  customerName: string;
  customerPhone: string;
  isNewCustomer: boolean;
  customerSearch: string;
  showCustomerList: boolean;
  newCustomerInfo: {
    name: string;
    phone: string;
    email: string;
    category: string;
  };
  date: string;
  time: string;
  service: string;
  notes: string;
}

interface Day {
  date: number;
  isCurrentMonth: boolean;
  fullDate: string;
  hasAppointment?: boolean;
  appointments?: Appointment[];
  isToday?: boolean;
}

// 상품 가격 정보 상태
interface ProductInfo {
  id: number;
  name: string;
  price: string;
  note: string;
}

// --- 브라우저 스토리지 헬퍼 함수 ---
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`localStorage 저장 실패: ${key}`, e);
  }
};

const loadFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error(`localStorage 불러오기 실패: ${key}`, e);
    return null;
  }
};

function App() {
  // ref 선언 (로그인용)
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const regUsernameRef = useRef<HTMLInputElement>(null);
  const regPasswordRef = useRef<HTMLInputElement>(null);
  const regConfirmPasswordRef = useRef<HTMLInputElement>(null);
  const regEmailRef = useRef<HTMLInputElement>(null);
  const regPhoneRef = useRef<HTMLInputElement>(null);
  const regStudioNameRef = useRef<HTMLInputElement>(null);
  const forgotUsernameRef = useRef<HTMLInputElement>(null);
  const forgotEmailRef = useRef<HTMLInputElement>(null);

  // 로그인 및 기본 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 인증 관련 상태
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // 메인 애플리케이션 상태
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [customerDetail, setCustomerDetail] = useState<Customer | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  // 고객 등록용 상품 선택 상태
  const [selectedProducts, setSelectedProducts] = useState<ProductInfo[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // 고객 등록용 이름 배열 상태
  const [customerNames, setCustomerNames] = useState<string[]>(['']);

  // 상품 입력 행 상태
  const [newProductRows, setNewProductRows] = useState<ProductInfo[]>([]);
  // 상품 목록 상태
  const [productInfos, setProductInfos] = useState<ProductInfo[]>(
    () => loadFromStorage('studioProductInfos') || []
  );

  const initialCustomers: Customer[] = [
    {
      id: 1,
      name: '김철수',
      phone: '010-1234-5678',
      email: 'kim@example.com',
      lastVisit: '2024-06-08',
      totalVisits: 3,
      notes: '프로필 촬영',
      category: '프로필사진',
      totalCost: 150000,
      deposit: 50000,
      paymentMethod: '카드',
      depositMethod: '현금',
    },
    {
      id: 2,
      name: '이영희',
      phone: '010-9876-5432',
      email: 'lee@example.com',
      lastVisit: '2024-06-08',
      totalVisits: 1,
      notes: '가족사진 촬영',
      category: '가족사진',
      totalCost: 200000,
      deposit: 100000,
      paymentMethod: '현금',
      depositMethod: '카드',
    },
  ];

  const initialAppointments: Appointment[] = [
    {
      id: 1,
      customerName: '김철수',
      date: '2024-06-08',
      time: '10:00',
      service: '프로필사진',
      status: '예약확정',
      notes: '정장 2벌 준비',
    },
    {
      id: 2,
      customerName: '이영희',
      date: '2024-06-10',
      time: '14:00',
      service: '가족사진',
      status: '예약대기',
      notes: '4인 가족사진',
    },
  ];

  const [customers, setCustomers] = useState<Customer[]>(
    () => loadFromStorage('studioCustomers') || initialCustomers
  );
  const [appointments, setAppointments] = useState<Appointment[]>(
    () => loadFromStorage('studioAppointments') || initialAppointments
  );

  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    name: '',
    phone: '',
    email: '',
    category: '반명함사진',
    notes: '',
    totalCost: '',
    deposit: '',
    paymentMethod: '카드',
    depositMethod: '카드',
  });

  const [newAppointment, setNewAppointment] = useState<NewAppointment>({
    customerName: '',
    customerPhone: '',
    isNewCustomer: false,
    customerSearch: '',
    showCustomerList: false,
    newCustomerInfo: {
      name: '',
      phone: '',
      email: '',
      category: '반명함사진',
    },
    date: '',
    time: '',
    service: '',
    notes: '',
  });

  const photoCategories = [
    '반명함사진',
    '여권사진',
    '비자사진',
    '민증사진',
    '운전면허사진',
    '프로필사진',
    '가족사진',
    '필름현상',
    '단체사진',
  ];

  const menuItems = [
    {
      id: 'dashboard',
      name: '대시보드',
      icon: Camera,
      subMenus: [{ id: 'home', name: '홈' }],
    },
    {
      id: 'customer',
      name: '신규고객 등록',
      icon: Users,
      subMenus: [
        { id: 'register', name: '고객 등록' },
        { id: 'list', name: '고객 목록' },
        { id: 'search', name: '고객 검색' },
      ],
    },
    {
      id: 'customerList',
      name: '고객 리스트',
      icon: Users,
      subMenus: [],
    },
    {
      id: 'management',
      name: '회계관리 통계',
      icon: DollarSign,
      subMenus: [
        { id: 'daily', name: '일별 매출' },
        { id: 'monthly', name: '월별 통계' },
        { id: 'yearly', name: '연간 통계' },
      ],
    },
    {
      id: 'work',
      name: '월스케줄',
      icon: Calendar,
      subMenus: [{ id: 'calendar', name: '달력 보기' }],
    },
    {
      id: 'reservation',
      name: '일스케줄',
      icon: Clock,
      subMenus: [
        { id: 'today', name: '오늘 일정' },
        { id: 'week', name: '주간 일정' },
      ],
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: MessageSquare,
      subMenus: [{ id: 'send', name: 'SMS 발송' }],
    },
    {
      id: 'productInfo',
      name: '상품가격정보',
      icon: CreditCard,
      subMenus: [],
    },
  ];

  // 인증 관련 함수들
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  };

  // 회원가입 처리
  const handleRegister = () => {
    setAuthError('');
    setAuthSuccess('');

    const username = regUsernameRef.current?.value || '';
    const password = regPasswordRef.current?.value || '';
    const confirmPassword = regConfirmPasswordRef.current?.value || '';
    const email = regEmailRef.current?.value || '';
    const phone = regPhoneRef.current?.value || '';
    const studioName = regStudioNameRef.current?.value || '';

    if (!username.trim()) {
      setAuthError('아이디를 입력해주세요.');
      return;
    }
    if (username.length < 4) {
      setAuthError('아이디는 4자 이상이어야 합니다.');
      return;
    }
    if (!validatePassword(password)) {
      setAuthError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!validateEmail(email)) {
      setAuthError('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    if (!validatePhone(phone)) {
      setAuthError('올바른 전화번호를 입력해주세요. (010-0000-0000)');
      return;
    }
    if (!studioName.trim()) {
      setAuthError('스튜디오명을 입력해주세요.');
      return;
    }

    const existingUsers: User[] = loadFromStorage('studioUsers') || [];
    const userExists = existingUsers.some(
      (user: User) => user.username === username || user.email === email
    );

    if (userExists) {
      setAuthError('이미 존재하는 아이디 또는 이메일입니다.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser: User = {
        id: Date.now().toString(),
        username,
        password,
        email,
        phone,
        studioName,
        createdAt: new Date().toISOString(),
        profile_image: '👤',
      };

      const users = [...existingUsers, newUser];
      saveToStorage('studioUsers', users);

      setIsLoading(false);
      setAuthSuccess('회원가입이 완료되었습니다! 자동 로그인 중...');

      // 회원가입 후 자동 로그인
      setTimeout(() => {
        setUserInfo(newUser);
        setIsLoggedIn(true);
        saveToStorage('studioUserInfo', newUser);
      }, 1500);
    }, 1500);
  };

  // 로그인 처리
  const handleLogin = () => {
    setAuthError('');
    setAuthSuccess('');

    const username = usernameRef.current?.value || '';
    const password = passwordRef.current?.value || '';

    console.log('로그인 시도:', { username, password }); // 디버깅용

    if (!username.trim() || !password.trim()) {
      setAuthError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const users: User[] = loadFromStorage('studioUsers') || [];
      console.log('저장된 사용자들:', users); // 디버깅용

      const user = users.find(
        (u: User) => u.username === username && u.password === password
      );

      console.log('찾은 사용자:', user); // 디버깅용

      if (user) {
        setUserInfo(user);
        setIsLoggedIn(true);
        setAuthSuccess('로그인 성공!');
        saveToStorage('studioUserInfo', user);
      } else {
        setAuthError('아이디 또는 비밀번호가 잘못되었습니다.');
      }
      setIsLoading(false);
    }, 1000);
  };

  // 비밀번호 찾기 처리
  const handleForgotPassword = () => {
    setAuthError('');
    setAuthSuccess('');

    const email = forgotEmailRef.current?.value || '';
    const username = forgotUsernameRef.current?.value || '';

    if (!email.trim() || !username.trim()) {
      setAuthError('아이디와 이메일을 모두 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setAuthError('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const users: User[] = loadFromStorage('studioUsers') || [];
      const user = users.find(
        (u: User) => u.username === username && u.email === email
      );

      if (user) {
        setAuthSuccess(`비밀번호: ${user.password}`);
      } else {
        setAuthError('일치하는 계정을 찾을 수 없습니다.');
      }
      setIsLoading(false);
    }, 1000);
  };

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('studioUserInfo');
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  // 메인 애플리케이션 함수들
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(
          minute
        ).padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  // 고객명 입력란 추가/삭제/변경 함수
  const handleAddCustomerName = () => setCustomerNames([...customerNames, '']);
  const handleRemoveCustomerName = (idx: number) => setCustomerNames(customerNames.filter((_, i) => i !== idx));
  const handleChangeCustomerName = (idx: number, value: string) => {
    const updated = [...customerNames];
    updated[idx] = value;
    setCustomerNames(updated);
  };

  // 신규 고객 등록 시 이름 입력란 초기화
  useEffect(() => {
    setCustomerNames(['']);
  }, [activeMenu]);

  // handleAddCustomer 함수 수정: 여러 명 등록
  const handleAddCustomer = () => {
    const validNames = customerNames.map(n => n.trim()).filter(Boolean);
    if (validNames.length === 0 || newCustomer.phone === '') return;
    const newCustomers: Customer[] = validNames.map(name => ({
      id: Date.now() + Math.random(),
      name,
      phone: newCustomer.phone,
      email: newCustomer.email,
      notes: newCustomer.notes,
      category: newCustomer.category,
      paymentMethod: newCustomer.paymentMethod,
      depositMethod: newCustomer.depositMethod,
      totalCost: totalSelectedProductPrice,
      deposit: parseInt(newCustomer.deposit) || 0,
      lastVisit: new Date().toISOString().split('T')[0],
      totalVisits: 1,
    }));
    setCustomers([...customers, ...newCustomers]);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      category: '반명함사진',
      notes: '',
      totalCost: '',
      deposit: '',
      paymentMethod: '카드',
      depositMethod: '카드',
    });
    setCustomerNames(['']);
    setSelectedProducts([]);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleAddAppointment = () => {
    if (newAppointment.date && newAppointment.time && newAppointment.service) {
      let customerName = newAppointment.customerName;

      if (
        newAppointment.isNewCustomer &&
        newAppointment.newCustomerInfo.name &&
        newAppointment.newCustomerInfo.phone
      ) {
        const newCustomerData: Customer = {
          id: Date.now(),
          name: newAppointment.newCustomerInfo.name,
          phone: newAppointment.newCustomerInfo.phone,
          email: newAppointment.newCustomerInfo.email || '',
          category: newAppointment.newCustomerInfo.category,
          notes: '',
          totalCost: 0,
          deposit: 0,
          paymentMethod: '카드',
          depositMethod: '카드',
          lastVisit: newAppointment.date,
          totalVisits: 1,
        };
        setCustomers([...customers, newCustomerData]);
        customerName = newAppointment.newCustomerInfo.name;
      }

      const appointment: Appointment = {
        id: Date.now() + 1,
        customerName: customerName,
        date: newAppointment.date,
        time: newAppointment.time,
        service: newAppointment.service,
        notes: newAppointment.notes || '',
        status: '예약확정',
      };

      setAppointments([...appointments, appointment]);

      setNewAppointment({
        customerName: '',
        customerPhone: '',
        isNewCustomer: false,
        customerSearch: '',
        showCustomerList: false,
        newCustomerInfo: {
          name: '',
          phone: '',
          email: '',
          category: '반명함사진',
        },
        date: '',
        time: '',
        service: '',
        notes: '',
      });
      setShowAppointmentForm(false);
    } else {
      alert('필수 정보를 모두 입력해주세요.');
    }
  };

  const handleSendSMS = () => {
    if (selectedCustomers.length > 0 && smsMessage.trim()) {
      alert(`${selectedCustomers.length}명에게 SMS가 발송되었습니다.`);
      setSmsMessage('');
      setSelectedCustomers([]);
    }
  };

  const toggleCustomerSelection = (customerId: number) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const getDailySales = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayCustomers = customers.filter((c) => c.lastVisit === today);
    return todayCustomers.reduce((sum, c) => sum + (c.totalCost || 0), 0);
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter((apt) => apt.date === today);
  };

  // 달력 날짜 생성
  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: Day[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate.getDate(),
        isCurrentMonth: false,
        fullDate: prevDate.toISOString().split('T')[0],
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      const dayAppointments = appointments.filter(
        (apt: Appointment) => apt.date === dateStr
      );
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push({
        date: day,
        isCurrentMonth: true,
        hasAppointment: dayAppointments.length > 0,
        appointments: dayAppointments,
        fullDate: dateStr,
        isToday: isToday,
      });
    }

    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: nextDate.toISOString().split('T')[0],
      });
    }

    return days;
  };

  // 고객 등록 폼 내 상품 자동완성 및 가격 합산
  const handleAddProductToCustomer = (product: ProductInfo) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };
  const handleRemoveProductFromCustomer = (id: number) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };
  const totalSelectedProductPrice = selectedProducts.reduce((sum, p) => sum + Number(p.price), 0);

  // 신규 고객 등록 시 상품 선택 초기화
  useEffect(() => {
    setSelectedProducts([]);
    setProductSearch('');
    setShowProductDropdown(false);
  }, [activeMenu]);

  // 창 제목 변경
  useEffect(() => {
    document.title = '클라쓰가 다른 고객관리';
  }, []);

  // 로그인 페이지 컴포넌트
  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4 text-white text-4xl">
            📷
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            클라쓰가 다른 고객관리
          </h1>
          <p className="text-gray-600 mb-4">
            {authMode === 'login' && '로그인하여 스튜디오 관리를 시작하세요'}
            {authMode === 'register' && '회원가입하여 스튜디오를 등록하세요'}
            {authMode === 'forgot' && '비밀번호를 찾아드립니다'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* 로그인 폼 */}
          {authMode === 'login' && (
            <div className="space-y-4">
              <h3 className="text-center text-lg font-semibold mb-4">
                계정으로 로그인
              </h3>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md text-sm">
                  {authSuccess}
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium">아이디</label>
                <input
                  ref={usernameRef}
                  type="text"
                  placeholder="아이디를 입력하세요"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm box-border"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  비밀번호
                </label>
                <input
                  ref={passwordRef}
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm box-border"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className={`w-full p-3 text-white rounded-md text-base font-semibold ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>

              <div className="text-center text-sm">
                <button
                  onClick={() => setAuthMode('forgot')}
                  className="text-blue-600 hover:underline mr-4"
                >
                  비밀번호 찾기
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-blue-600 hover:underline"
                >
                  회원가입
                </button>
              </div>
            </div>
          )}

          {/* 회원가입 폼 */}
          {authMode === 'register' && (
            <div className="space-y-4">
              <h3 className="text-center text-lg font-semibold mb-4">
                회원가입
              </h3>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md text-sm">
                  {authSuccess}
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium">
                  아이디 *
                </label>
                <input
                  ref={regUsernameRef}
                  type="text"
                  placeholder="4자 이상의 아이디"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm box-border"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  비밀번호 *
                </label>
                <input
                  ref={regPasswordRef}
                  type="password"
                  placeholder="6자 이상의 비밀번호"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm box-border"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  비밀번호 확인 *
                </label>
                <input
                  ref={regConfirmPasswordRef}
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm box-border"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  이메일 *
                </label>
                <input
                  ref={regEmailRef}
                  type="email"
                  placeholder="example@example.com"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm box-border"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  전화번호 *
                </label>
                <input
                  ref={regPhoneRef}
                  type="tel"
                  placeholder="010-0000-0000"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm box-border"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  스튜디오명 *
                </label>
                <input
                  ref={regStudioNameRef}
                  type="text"
                  placeholder="홍길동 사진관"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm box-border"
                />
              </div>

              <button
                onClick={handleRegister}
                disabled={isLoading}
                className={`w-full p-3 text-white rounded-md text-base font-semibold ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </button>

              <div className="text-center text-sm">
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-blue-600 hover:underline"
                >
                  이미 계정이 있으신가요? 로그인
                </button>
              </div>
            </div>
          )}

          {/* 비밀번호 찾기 폼 */}
          {authMode === 'forgot' && (
            <div className="space-y-4">
              <h3 className="text-center text-lg font-semibold mb-4">
                비밀번호 찾기
              </h3>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md text-sm">
                  {authSuccess}
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium">아이디</label>
                <input
                  ref={forgotUsernameRef}
                  type="text"
                  placeholder="아이디를 입력하세요"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm box-border"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">이메일</label>
                <input
                  ref={forgotEmailRef}
                  type="email"
                  placeholder="가입시 사용한 이메일"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm box-border"
                />
              </div>

              <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className={`w-full p-3 text-white rounded-md text-base font-semibold ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {isLoading ? '찾는 중...' : '비밀번호 찾기'}
              </button>

              <div className="text-center text-sm">
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-blue-600 hover:underline mr-4"
                >
                  로그인
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-blue-600 hover:underline"
                >
                  회원가입
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 고객 상세 모달 (계약일, 상품 검색/선택, 계약금 자동, 메모, 버튼)
  const CustomerDetailModal = ({ customer, onClose }: { customer: Customer, onClose: () => void }) => {
    // 모달 내 상태: 계약일, 선택상품, 메모
    const [contractDate, setContractDate] = useState(customer.lastVisit || '');
    const [selectedProducts, setSelectedProducts] = useState<ProductInfo[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [memo, setMemo] = useState(customer.notes || '');

    // 상품 추가/삭제
    const handleAddProduct = (product: ProductInfo) => {
      if (!selectedProducts.find((p) => p.id === product.id)) {
        setSelectedProducts([...selectedProducts, product]);
      }
      setProductSearch('');
      setShowProductDropdown(false);
    };
    const handleRemoveProduct = (id: number) => {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
    };
    const totalProductPrice = selectedProducts.reduce((sum, p) => sum + Number(p.price), 0);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl">×</button>
          <div className="flex items-center mb-4">
            <div className="text-3xl mr-3">👤</div>
            <div>
              <div className="text-xl font-bold">{customer.name}</div>
              <div className="text-xs text-gray-500">고객번호: {customer.id}</div>
              <div className="text-xs text-gray-500">등록일: {customer.lastVisit}</div>
            </div>
          </div>
          <table className="w-full mb-4 text-sm">
            <tbody>
              <tr>
                <td className="font-medium text-gray-700 w-24">연락처</td>
                <td>
                  <span
                    className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                    onClick={() => {
                      setActiveMenu('sms');
                      setSelectedCustomers([customer.id]);
                      onClose();
                    }}
                  >
                    {customer.phone}
                  </span>
                </td>
                <td className="font-medium text-gray-700 w-24">이메일</td>
                <td>
                  {customer.email ? (
                    <a
                      href={`https://mail.naver.com/write?to=${customer.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {customer.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-medium text-gray-700">계약일</td>
                <td colSpan={3}>
                  <input
                    type="date"
                    className="border rounded px-2 py-1 text-sm"
                    value={contractDate}
                    onChange={e => setContractDate(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className="font-medium text-gray-700">상품</td>
                <td colSpan={3}>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="상품명을 입력하세요"
                      value={productSearch}
                      onChange={e => {
                        setProductSearch(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      autoComplete="off"
                    />
                    {showProductDropdown && productSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {productInfos.filter(p => p.name.includes(productSearch)).length === 0 ? (
                          <div className="p-3 text-gray-500 text-center">검색 결과가 없습니다.</div>
                        ) : (
                          productInfos
                            .filter(p => p.name.includes(productSearch))
                            .map(p => (
                              <div
                                key={p.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => handleAddProduct(p)}
                              >
                                <span className="font-medium">{p.name}</span>
                                <span className="ml-2 text-blue-600">{Number(p.price).toLocaleString()}원</span>
                                {p.note && <span className="ml-2 text-xs text-gray-400">({p.note})</span>}
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                  {/* 선택된 상품 리스트 */}
                  {selectedProducts.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedProducts.map((p) => (
                        <div key={p.id} className="flex items-center bg-blue-50 rounded px-2 py-1 text-sm">
                          <span>{p.name} <span className="text-blue-600">{Number(p.price).toLocaleString()}원</span></span>
                          <button
                            className="ml-1 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveProduct(p.id)}
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-medium text-gray-700">계약금</td>
                <td colSpan={3}>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                    value={totalProductPrice.toLocaleString() + '원'}
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="font-medium text-gray-700">총 방문</td>
                <td>{customer.totalVisits}회</td>
                <td className="font-medium text-gray-700">상품 카테고리</td>
                <td>{customer.category}</td>
              </tr>
            </tbody>
          </table>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">상담/메모</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              rows={3}
              value={memo}
              onChange={e => setMemo(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">저장</button>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">인쇄</button>
            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">삭제</button>
          </div>
        </div>
      </div>
    );
  };

  // 고객 리스트 페이지
  const renderCustomerList = () => {
    // 검색 및 정렬
    const filtered = customers
      .filter(
        (c) =>
          c.name.includes(customerSearchTerm) ||
          c.phone.includes(customerSearchTerm)
      )
      .sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">고객 리스트</h2>
          <input
            type="text"
            placeholder="이름/전화번호 검색"
            className="border px-3 py-2 rounded-md text-sm"
            value={customerSearchTerm}
            onChange={e => setCustomerSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">전화번호</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">최근 방문일</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => setCustomerDetail(customer)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customerDetail && <CustomerDetailModal customer={customerDetail} onClose={() => setCustomerDetail(null)} />}
      </div>
    );
  };

  // 대시보드 검색 기능 및 최근 고객 10명 표시
  const [dashboardSearch, setDashboardSearch] = useState('');
  const dashboardFilteredCustomers = customers.filter(
    (c) =>
      c.name.includes(dashboardSearch) ||
      c.phone.includes(dashboardSearch)
  );
  const recentCustomers = [...customers]
    .sort((a, b) => b.lastVisit.localeCompare(a.lastVisit))
    .slice(0, 10);

  // 상품가격정보 페이지 (map 파라미터 타입 명시)
  const renderProductInfo = () => (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">상품 가격 정보</h2>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-lg"
          onClick={() =>
            setNewProductRows([
              ...newProductRows,
              { id: Date.now(), name: '', price: '', note: '' },
            ])
          }
        >
          +
        </button>
      </div>
      {/* 신규 상품 입력 행 */}
      {newProductRows.map((row: ProductInfo, idx: number) => (
        <div key={row.id} className="flex gap-2 mb-2 items-center">
          <input
            type="text"
            placeholder="상품명"
            className="border px-2 py-1 rounded w-1/3"
            value={row.name}
            onChange={e => {
              const updated = [...newProductRows];
              updated[idx].name = e.target.value;
              setNewProductRows(updated);
            }}
          />
          <input
            type="number"
            placeholder="가격"
            className="border px-2 py-1 rounded w-1/4"
            value={row.price}
            onChange={e => {
              const updated = [...newProductRows];
              updated[idx].price = e.target.value;
              setNewProductRows(updated);
            }}
          />
          <input
            type="text"
            placeholder="비고"
            className="border px-2 py-1 rounded w-1/3"
            value={row.note}
            onChange={e => {
              const updated = [...newProductRows];
              updated[idx].note = e.target.value;
              setNewProductRows(updated);
            }}
          />
          <button
            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-sm"
            onClick={() => {
              if (!row.name || !row.price) return;
              setProductInfos([
                ...productInfos,
                { ...row, id: Date.now() },
              ]);
              setNewProductRows(newProductRows.filter((_, i: number) => i !== idx));
            }}
          >
            저장
          </button>
        </div>
      ))}
      {/* 저장된 상품 리스트 */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">상품 목록</h3>
        {productInfos.length === 0 ? (
          <div className="text-gray-500">등록된 상품이 없습니다.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">가격</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">비고</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productInfos.map((p: ProductInfo) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{Number(p.price).toLocaleString()}원</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // 메인 콘텐츠 렌더링 함수
  const renderContent = () => {
    if (activeMenu === 'dashboard') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">클라쓰가 다른 고객관리</h2>
            <div className="text-sm text-gray-500">실시간 스튜디오 현황</div>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="고객 이름/전화번호 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dashboardSearch}
                onChange={e => setDashboardSearch(e.target.value)}
              />
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              onClick={() => setActiveMenu('customerList')}
            >
              전체 고객
            </button>
          </div>
          {/* 검색 결과 */}
          {dashboardSearch && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="text-sm font-bold mb-2">검색 결과</h3>
              {dashboardFilteredCustomers.length === 0 ? (
                <div className="text-gray-500">검색 결과가 없습니다.</div>
              ) : (
                <ul>
                  {dashboardFilteredCustomers.map((c) => (
                    <li
                      key={c.id}
                      className="py-2 border-b last:border-b-0 cursor-pointer hover:text-blue-600"
                      onClick={() => setCustomerDetail(c)}
                    >
                      {c.name} ({c.phone})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* --- 빠른 메뉴 복원 --- */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">빠른 메뉴</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveMenu('customer')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium">신규 고객 등록</div>
              </button>
              <button
                onClick={() => setActiveMenu('work')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium">일정 관리</div>
              </button>
              <button
                onClick={() => setActiveMenu('management')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium">매출 통계</div>
              </button>
              <button
                onClick={() => setActiveMenu('sms')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <MessageSquare className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm font-medium">SMS 발송</div>
              </button>
            </div>
          </div>

          {/* --- 오늘 일정/고객 미리보기 복원 --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">오늘 예약 일정</h3>
              {getTodayAppointments().length > 0 ? (
                <div className="space-y-3">
                  {getTodayAppointments().slice(0, 5).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {appointment.time} - {appointment.customerName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {appointment.service}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          appointment.status === '예약확정'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                  {getTodayAppointments().length > 5 && (
                    <div className="text-center text-sm text-gray-500">
                      +{getTodayAppointments().length - 5}개 더
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>오늘 예약된 일정이 없습니다.</p>
                </div>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">오늘 방문 고객</h3>
              {customers.filter((c) => c.lastVisit === new Date().toISOString().split('T')[0]).length > 0 ? (
                <div className="space-y-3">
                  {customers
                    .filter((c) => c.lastVisit === new Date().toISOString().split('T')[0])
                    .slice(0, 5)
                    .map((customer) => (
                      <div
                        key={customer.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-600">{customer.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{customer.totalCost.toLocaleString()}원</div>
                          <div className="text-xs text-gray-500">{customer.paymentMethod}</div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>오늘 방문한 고객이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 최근 방문 고객 10명 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">최근 방문 고객 (최대 10명)</h3>
              <button
                className="text-blue-600 hover:underline text-sm"
                onClick={() => setActiveMenu('customerList')}
              >
                전체 고객 보기
              </button>
            </div>
            {recentCustomers.length > 0 ? (
              <div className="space-y-3">
                {recentCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded cursor-pointer hover:bg-blue-100"
                    onClick={() => setCustomerDetail(customer)}
                  >
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{customer.totalCost.toLocaleString()}원</div>
                      <div className="text-xs text-gray-500">{customer.paymentMethod}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>최근 방문한 고객이 없습니다.</p>
              </div>
            )}
          </div>
          {customerDetail && <CustomerDetailModal customer={customerDetail} onClose={() => setCustomerDetail(null)} />}
        </div>
      );
    }

    if (activeMenu === 'customer') {
      return (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            신규 고객 등록
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 여러명 고객명 입력란 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                고객명 *
              </label>
              {customerNames.map((name, idx) => (
                <div key={idx} className="flex items-center mb-2 gap-2">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={name}
                    onChange={e => handleChangeCustomerName(idx, e.target.value)}
                    placeholder={`고객명${customerNames.length > 1 ? ` (${idx + 1})` : ''}`}
                  />
                  {customerNames.length > 1 && (
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 text-lg px-2"
                      onClick={() => handleRemoveCustomerName(idx)}
                    >
                      ×
                    </button>
                  )}
                  {idx === customerNames.length - 1 && (
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 text-lg px-2"
                      onClick={handleAddCustomerName}
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호 *
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                placeholder="010-0000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                촬영종류
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={newCustomer.category}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, category: e.target.value })
                }
              >
                {photoCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {/* 상품 검색 및 선택 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품 검색 및 선택
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="상품명을 입력하세요"
                  value={productSearch}
                  onChange={e => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  autoComplete="off"
                />
                {showProductDropdown && productSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {productInfos.filter(p => p.name.includes(productSearch)).length === 0 ? (
                      <div className="p-3 text-gray-500 text-center">검색 결과가 없습니다.</div>
                    ) : (
                      productInfos
                        .filter(p => p.name.includes(productSearch))
                        .map(p => (
                          <div
                            key={p.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => handleAddProductToCustomer(p)}
                          >
                            <span className="font-medium">{p.name}</span>
                            <span className="ml-2 text-blue-600">{Number(p.price).toLocaleString()}원</span>
                            {p.note && <span className="ml-2 text-xs text-gray-400">({p.note})</span>}
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
              {/* 선택된 상품 리스트 */}
              {selectedProducts.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedProducts.map((p) => (
                    <div key={p.id} className="flex items-center bg-blue-50 rounded px-2 py-1 text-sm">
                      <span>{p.name} <span className="text-blue-600">{Number(p.price).toLocaleString()}원</span></span>
                      <button
                        className="ml-1 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveProductFromCustomer(p.id)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* 총 촬영비용 (자동합산, 읽기전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                총 촬영비용 (자동합산)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                value={totalSelectedProductPrice.toLocaleString() + '원'}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선금 (원)
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={newCustomer.deposit}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, deposit: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                총비용 결제방법
              </label>
              <div className="flex space-x-4 mt-1">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="카드"
                    checked={newCustomer.paymentMethod === '카드'}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="mr-2"
                  />
                  카드
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="현금"
                    checked={newCustomer.paymentMethod === '현금'}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="mr-2"
                  />
                  현금
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선금 결제방법
              </label>
              <div className="flex space-x-4 mt-1">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="depositMethod"
                    value="카드"
                    checked={newCustomer.depositMethod === '카드'}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        depositMethod: e.target.value,
                      })
                    }
                    className="mr-2"
                  />
                  카드
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="depositMethod"
                    value="현금"
                    checked={newCustomer.depositMethod === '현금'}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        depositMethod: e.target.value,
                      })
                    }
                    className="mr-2"
                  />
                  현금
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              value={newCustomer.notes}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, notes: e.target.value })
              }
              placeholder="특이사항이나 요청사항을 입력하세요"
            />
          </div>

          {/* 금액 요약 */}
          {(newCustomer.totalCost || newCustomer.deposit) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                결제 요약
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">총 촬영비용:</span>
                  <span className="ml-2 font-medium">
                    {(
                      parseInt(newCustomer.totalCost) || 0
                    ).toLocaleString()}
                    원
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">선금:</span>
                  <span className="ml-2 font-medium">
                    {(parseInt(newCustomer.deposit) || 0).toLocaleString()}원
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">잔금:</span>
                  <span className="ml-2 font-medium text-red-600">
                    {(
                      (parseInt(newCustomer.totalCost) || 0) -
                      (parseInt(newCustomer.deposit) || 0)
                    ).toLocaleString()}
                    원
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">결제방법:</span>
                  <span className="ml-2 font-medium">
                    총비용: {newCustomer.paymentMethod} | 선금:{' '}
                    {newCustomer.depositMethod}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() =>
                setNewCustomer({
                  name: '',
                  phone: '',
                  email: '',
                  category: '반명함사진',
                  notes: '',
                  totalCost: '',
                  deposit: '',
                  paymentMethod: '카드',
                  depositMethod: '카드',
                })
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              초기화
            </button>
            <button
              onClick={handleAddCustomer}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              등록
            </button>
          </div>
        </div>
      );
    }

    if (activeMenu === 'management') {
      const todayCustomers = customers.filter(
        (c) => c.lastVisit === new Date().toISOString().split('T')[0]
      );
      const todayAppointments = getTodayAppointments();

      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            일별 매출 현황
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    오늘 총 매출
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {getDailySales().toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    오늘 방문 고객
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {todayCustomers.length}명
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">카드 결제</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {todayCustomers
                      .filter((c) => c.paymentMethod === '카드')
                      .reduce((sum, c) => sum + c.totalCost, 0)
                      .toLocaleString()}
                    원
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">현금 결제</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {todayCustomers
                      .filter((c) => c.paymentMethod === '현금')
                      .reduce((sum, c) => sum + c.totalCost, 0)
                      .toLocaleString()}
                    원
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 오늘 방문 고객 상세 정보 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                오늘 방문 고객 내역
              </h3>
            </div>

            {todayCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        방문시간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        고객명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        연락처
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        촬영종류
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        총 비용
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        선금
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        잔금
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        결제방법
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todayCustomers.map((customer, index) => {
                      // 해당 고객의 오늘 예약 시간 찾기
                      const customerAppointment = todayAppointments.find(
                        (apt) => apt.customerName === customer.name
                      );
                      const visitTime = customerAppointment
                        ? customerAppointment.time
                        : '시간 미정';

                      return (
                        <tr
                          key={customer.id}
                          className={
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {visitTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.totalCost.toLocaleString()}원
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.deposit.toLocaleString()}원
                            <span className="text-xs text-gray-400 ml-1">
                              ({customer.depositMethod})
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                            {(
                              customer.totalCost - customer.deposit
                            ).toLocaleString()}
                            원
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                customer.paymentMethod === '카드'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {customer.paymentMethod}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">오늘 방문한 고객이 없습니다.</p>
              </div>
            )}
          </div>

          {/* 결제 방법별 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                결제 방법별 요약
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">카드 결제 건수:</span>
                  <span className="font-medium">
                    {
                      todayCustomers.filter((c) => c.paymentMethod === '카드')
                        .length
                    }
                    건
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">현금 결제 건수:</span>
                  <span className="font-medium">
                    {
                      todayCustomers.filter((c) => c.paymentMethod === '현금')
                        .length
                    }
                    건
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-sm text-gray-600">총 선금 수금:</span>
                  <span className="font-medium text-green-600">
                    {todayCustomers
                      .reduce((sum, c) => sum + c.deposit, 0)
                      .toLocaleString()}
                    원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">미수금 (잔금):</span>
                  <span className="font-medium text-red-600">
                    {todayCustomers
                      .reduce(
                        (sum, c) =>
                          sum + (c.totalCost - c.deposit),
                        0
                      )
                      .toLocaleString()}
                    원
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                촬영 종류별 매출
              </h3>
              <div className="space-y-3">
                {photoCategories.map((category) => {
                  const categoryCustomers = todayCustomers.filter(
                    (c) => c.category === category
                  );
                  const categoryRevenue = categoryCustomers.reduce(
                    (sum, c) => sum + c.totalCost,
                    0
                  );

                  if (categoryCustomers.length > 0) {
                    return (
                      <div
                        key={category}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-gray-600">
                          {category}:
                        </span>
                        <div className="text-right">
                          <span className="font-medium">
                            {categoryRevenue.toLocaleString()}원
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({categoryCustomers.length}건)
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === 'reservation') {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">오늘 일정</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-2xl font-bold text-blue-600">
                {getTodayAppointments().length}
              </p>
              <p className="text-sm text-gray-500">총 예약</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-2xl font-bold text-green-600">
                {
                  getTodayAppointments().filter(
                    (apt) => apt.status === '예약확정'
                  ).length
                }
              </p>
              <p className="text-sm text-gray-500">확정 예약</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-2xl font-bold text-purple-600">
                {getDailySales().toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">예상 매출 (원)</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                시간별 스케줄
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {getTimeSlots().map((timeSlot) => {
                const appointment = getTodayAppointments().find(
                  (apt) => apt.time === timeSlot
                );
                return (
                  <div key={timeSlot} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-gray-900 w-16">
                          {timeSlot}
                        </div>
                        {appointment ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.customerName} - {appointment.service}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">예약 없음</div>
                        )}
                      </div>
                      {appointment && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === '예약확정'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === 'sms') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 고객 목록 */}
          <div className="md:col-span-2 bg-white shadow rounded-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">고객 선택</h3>
              <button
                onClick={() => {
                  if (selectedCustomers.length === customers.length) {
                    setSelectedCustomers([]);
                  } else {
                    setSelectedCustomers(customers.map((c) => c.id));
                  }
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                {selectedCustomers.length === customers.length
                  ? '전체 해제'
                  : '전체 선택'}
              </button>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      선택
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      전화번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      카테고리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => toggleCustomerSelection(customer.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SMS 작성 */}
          <div className="bg-white shadow rounded-lg p-6 space-y-4 h-fit">
            <h3 className="text-lg font-medium">메시지 작성</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선택된 고객 ({selectedCustomers.length}명)
              </label>
              <div className="w-full p-3 h-24 border rounded-md bg-gray-50 overflow-y-auto text-sm">
                {selectedCustomers.length > 0 ? (
                  customers
                    .filter((c) => selectedCustomers.includes(c.id))
                    .map((c) => c.name)
                    .join(', ')
                ) : (
                  <span className="text-gray-400">고객을 선택해주세요.</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메시지 내용
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={8}
                placeholder="발송할 메시지를 입력하세요..."
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {smsMessage.length} / 90 Bytes (한글 45자)
              </p>
            </div>
            <button
              onClick={handleSendSMS}
              disabled={selectedCustomers.length === 0 || !smsMessage.trim()}
              className="w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300"
            >
              SMS 발송
            </button>
          </div>
        </div>
      );
    }

    if (activeMenu === 'work') {
      const calendarDays = getCalendarDays();
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {year}년 {month + 1}월 스케줄
            </h2>
            <div className="flex space-x-2">
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
                Google Calendar 연동
              </button>
              <button className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 text-sm">
                Notion 연동
              </button>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 bg-blue-600 text-white">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div
                  key={day}
                  className={`p-4 text-center font-bold ${
                    index === 0
                      ? 'text-red-200'
                      : index === 6
                      ? 'text-blue-200'
                      : ''
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`h-32 border-r border-b border-gray-200 p-2 relative ${
                    day.isCurrentMonth
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-gray-100'
                  } ${
                    day.isToday ? 'bg-blue-100 border-2 border-blue-500' : ''
                  }`}
                >
                  <div
                    className={`text-sm font-bold mb-1 flex justify-between ${
                      day.isCurrentMonth
                        ? index % 7 === 0
                          ? 'text-red-600'
                          : index % 7 === 6
                          ? 'text-blue-600'
                          : 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    <span
                      className={
                        day.isToday
                          ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs'
                          : ''
                      }
                    >
                      {day.date}
                    </span>
                    {day.appointments && day.appointments.length > 0 && (
                      <span className="bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                        {day.appointments.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mb-6">
                    {day.appointments &&
                      day.appointments
                        .slice(0, 2)
                        .map((appointment, aptIndex) => (
                          <div
                            key={aptIndex}
                            className={`text-xs p-1 rounded ${
                              appointment.status === '예약확정'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            <div className="font-medium">
                              {appointment.time}
                            </div>
                            <div className="truncate">
                              {appointment.customerName}
                            </div>
                          </div>
                        ))}

                    {day.appointments && day.appointments.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{day.appointments.length - 2}개
                      </div>
                    )}
                  </div>

                  {/* 예약 추가 버튼 */}
                  <button
                    onClick={() => {
                      setNewAppointment({
                        customerName: '',
                        customerPhone: '',
                        isNewCustomer: false,
                        customerSearch: '',
                        showCustomerList: false,
                        newCustomerInfo: {
                          name: '',
                          phone: '',
                          email: '',
                          category: '반명함사진',
                        },
                        date: day.fullDate,
                        time: '',
                        service: '',
                        notes: '',
                      });
                      setShowAppointmentForm(true);
                    }}
                    className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all hover:scale-110"
                    title={`${day.date}일 예약 추가`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 예약 추가 모달 */}
          {showAppointmentForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-screen overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  새 예약 등록
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      고객 정보
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="customerType"
                          checked={!newAppointment.isNewCustomer}
                          onChange={() =>
                            setNewAppointment({
                              ...newAppointment,
                              isNewCustomer: false,
                            })
                          }
                          className="mr-2"
                        />
                        기존 고객
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="customerType"
                          checked={newAppointment.isNewCustomer}
                          onChange={() =>
                            setNewAppointment({
                              ...newAppointment,
                              isNewCustomer: true,
                            })
                          }
                          className="mr-2"
                        />
                        신규 고객
                      </label>
                    </div>
                  </div>

                  {!newAppointment.isNewCustomer && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        기존 고객 검색
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                          placeholder="고객 이름 또는 전화번호로 검색..."
                          value={newAppointment.customerSearch}
                          onChange={(e) => {
                            setNewAppointment({
                              ...newAppointment,
                              customerSearch: e.target.value,
                              showCustomerList: e.target.value.length > 0,
                            });
                          }}
                          onFocus={() => {
                            if (newAppointment.customerSearch.length > 0) {
                              setNewAppointment({
                                ...newAppointment,
                                showCustomerList: true,
                              });
                            }
                          }}
                        />
                        <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>

                      {/* 검색 결과 리스트 */}
                      {newAppointment.showCustomerList &&
                        newAppointment.customerSearch && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {customers
                              .filter(
                                (customer) =>
                                  customer.name
                                    .toLowerCase()
                                    .includes(
                                      newAppointment.customerSearch.toLowerCase()
                                    ) ||
                                  customer.phone.includes(
                                    newAppointment.customerSearch
                                  )
                              )
                              .map((customer) => (
                                <div
                                  key={customer.id}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => {
                                    setNewAppointment({
                                      ...newAppointment,
                                      customerName: customer.name,
                                      customerPhone: customer.phone,
                                      customerSearch: customer.name,
                                      showCustomerList: false,
                                    });
                                  }}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {customer.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {customer.phone}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        주 촬영: {customer.category}
                                      </div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                      <div>최근방문</div>
                                      <div className="font-medium">
                                        {customer.lastVisit}
                                      </div>
                                      <div>{customer.totalVisits}회 방문</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {customers.filter(
                              (customer) =>
                                customer.name
                                  .toLowerCase()
                                  .includes(
                                    newAppointment.customerSearch.toLowerCase()
                                  ) ||
                                customer.phone.includes(
                                  newAppointment.customerSearch
                                )
                            ).length === 0 && (
                              <div className="p-3 text-gray-500 text-center">
                                검색 결과가 없습니다.
                              </div>
                            )}
                          </div>
                        )}

                      {/* 선택된 고객 정보 표시 */}
                      {newAppointment.customerName &&
                        !newAppointment.showCustomerList && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-md">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-blue-900">
                                  선택된 고객: {newAppointment.customerName}
                                </div>
                                <div className="text-sm text-blue-700">
                                  {newAppointment.customerPhone}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewAppointment({
                                    ...newAppointment,
                                    customerName: '',
                                    customerPhone: '',
                                    customerSearch: '',
                                  });
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                변경
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {newAppointment.isNewCustomer && (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700">
                        신규 고객 정보
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600">
                            고객명 *
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            value={newAppointment.newCustomerInfo.name}
                            onChange={(e) =>
                              setNewAppointment({
                                ...newAppointment,
                                newCustomerInfo: {
                                  ...newAppointment.newCustomerInfo,
                                  name: e.target.value,
                                },
                              })
                            }
                            placeholder="이름을 입력하세요"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">
                            연락처 *
                          </label>
                          <input
                            type="tel"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            value={newAppointment.newCustomerInfo.phone}
                            onChange={(e) =>
                              setNewAppointment({
                                ...newAppointment,
                                newCustomerInfo: {
                                  ...newAppointment.newCustomerInfo,
                                  phone: e.target.value,
                                },
                              })
                            }
                            placeholder="010-0000-0000"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        예약 날짜 *
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        value={newAppointment.date}
                        onChange={(e) =>
                          setNewAppointment({
                            ...newAppointment,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        예약 시간 *
                      </label>
                      <select
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        value={newAppointment.time}
                        onChange={(e) =>
                          setNewAppointment({
                            ...newAppointment,
                            time: e.target.value,
                          })
                        }
                      >
                        <option value="">시간 선택</option>
                        {getTimeSlots().map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      촬영 종류 *
                    </label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={newAppointment.service}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          service: e.target.value,
                        })
                      }
                    >
                      <option value="">촬영 종류 선택</option>
                      {photoCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      특별 요청사항
                    </label>
                    <textarea
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                      value={newAppointment.notes}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          notes: e.target.value,
                        })
                      }
                      placeholder="특별히 요청하실 사항이 있으시면 적어주세요..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAppointmentForm(false);
                      setNewAppointment({
                        customerName: '',
                        customerPhone: '',
                        isNewCustomer: false,
                        customerSearch: '',
                        showCustomerList: false,
                        newCustomerInfo: {
                          name: '',
                          phone: '',
                          email: '',
                          category: '반명함사진',
                        },
                        date: '',
                        time: '',
                        service: '',
                        notes: '',
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAddAppointment}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    예약 등록
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-3">범례</h3>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                <span>예약확정</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 rounded mr-2"></div>
                <span>예약대기</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded mr-2"></div>
                <span>오늘</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === 'customerList') {
      return renderCustomerList();
    }

    if (activeMenu === 'productInfo') {
      return renderProductInfo();
    }

    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          개발 중입니다
        </h2>
        <p className="text-gray-600">선택하신 메뉴는 개발 중입니다.</p>
      </div>
    );
  };

  // 초기 데이터 및 로그인 상태 로드
  useEffect(() => {
    // 사용자 목록 초기화
    if (loadFromStorage('studioUsers') === null) {
      saveToStorage('studioUsers', []);
    }

    // 로그인 상태 복원
    const loggedInUser = loadFromStorage('studioUserInfo');
    if (loggedInUser) {
      setUserInfo(loggedInUser);
      setIsLoggedIn(true);
    }
  }, []);

  // 데이터 변경 시 LocalStorage에 자동 저장
  useEffect(() => {
    saveToStorage('studioCustomers', customers);
  }, [customers]);

  useEffect(() => {
    saveToStorage('studioAppointments', appointments);
  }, [appointments]);

  // 상품 정보 저장
  useEffect(() => {
    saveToStorage('studioProductInfos', productInfos);
  }, [productInfos]);

  // 로그인 상태가 아니면 로그인 페이지 표시
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  // 메인 애플리케이션 렌더링
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold">스튜디오</h1>
              <p className="text-xs text-gray-400">관리 프로그램</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">{userInfo?.profile_image || '👤'}</span>
            <div>
              <div className="text-sm font-medium">{userInfo?.username}</div>
              <div className="text-xs text-gray-400">
                {userInfo?.studioName}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            <p>현재 시간</p>
            <p>{new Date().toLocaleTimeString('ko-KR')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="전체 검색..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={() => {}}
                />
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAppointmentForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  새 예약
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
