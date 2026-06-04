'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'am';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.lessons': 'Lessons',
    'nav.events': 'Events',
    'nav.marketplace': 'Marketplace',
    'nav.resources': 'Resources',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.login': 'Login',
    'nav.getStarted': 'Get Started',
    'nav.workspace': 'Workspace',
    'nav.admin': 'Admin',
    'nav.teacher': 'Teacher',
    'nav.seller': 'Seller',
    'nav.signOut': 'Sign Out',
    'nav.welcome': 'Welcome',

    // Footer
    'footer.desc': 'Empowering Ethiopian students to discover, learn, and shine through hobbies.',
    'footer.quickLinks': 'Quick Links',
    'footer.hobbies': 'Popular Hobbies',
    'footer.contact': 'Contact Us',
    'footer.rights': 'All rights reserved.',
    'footer.terms': 'Terms & Conditions',
    'footer.privacy': 'Privacy Policy',

    // Home / Landing
    'hero.badge': 'Unlock Your Creative Potential',
    'hero.title1': 'Discover. Learn.',
    'hero.title2': 'Create. Shine.',
    'hero.subtitle': 'Discover your passion, learn from expert mentors, participate in exciting national exhibitions, and purchase official physical tools/kits directly in Ethiopia.',
    'hero.explore': 'Explore Hobbies',
    'hero.howItWorks': 'How It Works',
    'hero.statsStudents': 'Active Learners',
    'hero.statsMentors': 'Expert Mentors',
    'hero.statsProjects': 'Projects Created',
    'hero.statsExhibitions': 'Exhibitions Hosted',

    // Sections
    'sec.categoriesTitle': 'Explore by Category',
    'sec.categoriesSubtitle': 'Find the perfect hobby that matches your creative spark',
    'sec.popularTitle': 'Popular Hobbies',
    'sec.popularSubtitle': 'Highly requested hobby courses designed for practical skills',
    'sec.howTitle': 'How HobbyHub Works',
    'sec.howSubtitle': 'Four simple steps to turn your interest into a certified talent',
    'sec.testimonialsTitle': 'What Our Students Say',
    'sec.testimonialsSubtitle': 'Real stories from passionate learners across Ethiopia',
    'sec.ctaTitle': 'Ready to Turn Your Passion Into Reality?',
    'sec.ctaSubtitle': 'Join thousands of Ethiopian students exploring creative fields, building physical projects, and displaying them at national exhibitions.',
    'sec.ctaButton': 'Sign Up Today',

    // Steps
    'step1.title': '1. Choose Your Passion',
    'step1.desc': 'Browse our diverse categories from arts to technology to find your calling.',
    'step2.title': '2. Live & Hands-on Learning',
    'step2.desc': 'Attend live, interactive lessons with top mentors and receive physical resource kits.',
    'step3.title': '3. Build Physical Projects',
    'step3.desc': 'Apply your learning directly by creating tangible projects with guided instructions.',
    'step4.title': '4. Showcase & Win',
    'step4.desc': 'Exhibit your work in local/national fairs, gain recognition, and win awards.',

    // Common Buttons / Labels
    'btn.addToCart': 'Add to Cart',
    'btn.buyNow': 'Buy Now',
    'btn.checkout': 'Checkout',
    'btn.back': 'Back',
    'btn.submit': 'Submit',
    'btn.search': 'Search',
    'label.price': 'Price',
    'label.rating': 'Rating',
    'label.category': 'Category',
    'label.duration': 'Duration',
    'label.enrolled': 'Enrolled',

    // Categories
    'cat.music': 'Music',
    'cat.art': 'Art & Craft',
    'cat.tech': 'Tech & Coding',
    'cat.robotics': 'Robotics & STEM',
    'cat.gaming': 'Gaming & AI',
    'cat.photography': 'Photography',
    'cat.diy': 'DIY & Design',

    // Auth
    'auth.welcomeBack': 'Welcome Back',
    'auth.loginDesc': 'Login to your HobbyHub Education account',
    'auth.createAccount': 'Create Account',
    'auth.registerDesc': 'Join HobbyHub Education and start your learning journey',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.orContinue': 'Or continue with',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.haveAccount': 'Already have an account?',
    'auth.signUp': 'Sign Up',
    'auth.signIn': 'Sign In',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',

    // Dashboard
    'dash.myWorkspace': 'My Workspace',
    'dash.enrolledhobbies': 'Enrolled Hobbies',
    'dash.myeventregistrations': 'My Event Registrations',
    'dash.orders': 'My Orders',
    'dash.welcomeUser': 'Welcome,',
    'dash.learningProgress': 'Learning Progress',
    'dash.noEnrolled': 'You haven\'t enrolled in any hobbies yet.',
    'dash.browseHobbies': 'Browse Hobbies',
    
    // Live classes / Lessons
    'lessons.title': 'Interactive Live Lessons',
    'lessons.subtitle': 'Join real-time classrooms with professional HobbyHub certified educators.',
    'lessons.joinCall': 'Join Call',
    'lessons.upcoming': 'Upcoming Lessons',
    'lessons.active': 'Active Lessons',
    'lessons.noUpcoming': 'No upcoming live classes scheduled.',

    // Checkout
    'check.checkoutTitle': 'Checkout',
    'check.deliveryTitle': 'Delivery Information',
    'check.paymentTitle': 'Payment Method',
    'check.summaryTitle': 'Order Summary',
    'check.placeOrder': 'Place Order',
    'check.shippingAddress': 'Shipping Address',
    'check.total': 'Total',
  },
  am: {
    // Nav
    'nav.home': 'መነሻ',
    'nav.courses': 'ኮርሶች',
    'nav.lessons': 'ትምህርቶች',
    'nav.events': 'ሁነቶች',
    'nav.marketplace': 'የገበያ ቦታ',
    'nav.resources': 'ግብዓቶች',
    'nav.blog': 'ብሎግ',
    'nav.about': 'ስለ እኛ',
    'nav.login': 'ግንኙነት (ግባ)',
    'nav.getStarted': 'ይመዝገቡ',
    'nav.workspace': 'የስራ ቦታ',
    'nav.admin': 'አስተዳዳሪ',
    'nav.teacher': 'አስተማሪ',
    'nav.seller': 'ሻጭ',
    'nav.signOut': 'ውጣ',
    'nav.welcome': 'እንኳን ደህና መጡ',

    // Footer
    'footer.desc': 'የኢትዮጵያ ተማሪዎች በትርፍ ጊዜ ማሳለፊያዎቻቸው አማካኝነት የፈጠራ ብቃታቸውን እንዲያገኙ፣ እንዲማሩ እና እንዲያበሩ ማስቻል።',
    'footer.quickLinks': 'ፈጣን ሊንኮች',
    'footer.hobbies': 'ተወዳጅ ክህሎቶች',
    'footer.contact': 'አግኙን',
    'footer.rights': 'መብቱ በህግ የተጠበቀ ነው።',
    'footer.terms': 'ደንቦች እና ሁኔታዎች',
    'footer.privacy': 'የግላዊነት ፖሊሲ',

    // Home / Landing
    'hero.badge': 'የፈጠራ አቅምዎን ያውጡ',
    'hero.title1': 'ያግኙ። ይማሩ።',
    'hero.title2': 'ይፍጠሩ። ያብሩ።',
    'hero.subtitle': 'ፍላጎትዎን ያግኙ፣ ከባለሙያ መካሪዎች ይማሩ፣ በአስደሳች ብሔራዊ ኤግዚቢሽኖች ላይ ይሳተፉ፣ እና ኦፊሴላዊ የትርፍ ጊዜ ማሳለፊያ መሳሪያዎችን/ዕቃዎችን በቀጥታ በኢትዮጵያ ይግዙ።',
    'hero.explore': 'ክህሎቶችን ያስሱ',
    'hero.howItWorks': 'እንዴት እንደሚሰራ',
    'hero.statsStudents': 'ንቁ ተማሪዎች',
    'hero.statsMentors': 'ባለሙያ መካሪዎች',
    'hero.statsProjects': 'የተፈጠሩ ፕሮጀክቶች',
    'hero.statsExhibitions': 'የተስተናገዱ ኤግዚቢሽኖች',

    // Sections
    'sec.categoriesTitle': 'በምድብ ያስሱ',
    'sec.categoriesSubtitle': 'ከፈጠራ ፍላጎትዎ ጋር የሚዛመደውን ፍጹም የትርፍ ጊዜ ማሳለፊያ ያግኙ',
    'sec.popularTitle': 'ታዋቂ የትርፍ ጊዜ ስራዎች',
    'sec.popularSubtitle': 'ለተግባራዊ ክህሎቶች ተብለው የተነደፉ በጣም ተፈላጊ የትርፍ ጊዜ ማሳለፊያ ኮርሶች',
    'sec.howTitle': 'ሆቢሀብ እንዴት ይሰራል?',
    'sec.howSubtitle': 'ፍላጎትዎን ወደ ተረጋገጠ ተሰጥኦ ለመቀየር አራት ቀላል ደረጃዎች',
    'sec.testimonialsTitle': 'የተማሪዎቻችን ምስክርነት',
    'sec.testimonialsSubtitle': 'በኢትዮጵያ ውስጥ ካሉ ንቁ ተማሪዎች የተገኙ እውነተኛ ታሪኮች',
    'sec.ctaTitle': 'ፍላጎትዎን ወደ እውነታ ለመቀየር ዝግጁ ነዎት?',
    'sec.ctaSubtitle': 'የፈጠራ መስኮችን በመመርመር፣ ተግባራዊ ፕሮጀክቶችን በመገንባትና በብሔራዊ ኤግዚቢሽኖች ላይ በሚያሳዩ በሺዎች በሚቆጠሩ ኢትዮጵያውያን ተማሪዎች መካከል ይቀላቀሉ።',
    'sec.ctaButton': 'ዛሬውኑ ይመዝገቡ',

    // Steps
    'step1.title': '1. ፍላጎትዎን ይምረጡ',
    'step1.desc': 'ፍላጎትዎን ለማግኘት ከኪነጥበብ እስከ ቴክኖሎጂ ያሉትን የተለያዩ ምድቦቻችንን ያስሱ።',
    'step2.title': '2. የቀጥታ እና የተግባር ትምህርት',
    'step2.desc': 'ከፍተኛ ደረጃ ካላቸው መካሪዎች ጋር የቀጥታና በይነተገናኝ ትምህርቶችን ይከታተሉ እና የተግባር ቁሳቁሶችን ያግኙ።',
    'step3.title': '3. ተግባራዊ ፕሮጀክቶችን ይገንቡ',
    'step3.desc': 'በቀረቡት መመሪያዎች መሰረት የሚጨበጡ ፕሮጀክቶችን በመፍጠር ትምህርትዎን በተግባር ላይ ያውሉ።',
    'step4.title': '4. ስራዎን ያሳዩ እና ያሸንፉ',
    'step4.desc': 'ስራዎን በአካባቢያዊ/ብሔራዊ ኤግዚቢሽኖች ላይ ያሳዩ፣ እውቅና ያግኙ እና ሽልማቶችን ያሸንፉ።',

    // Common Buttons / Labels
    'btn.addToCart': 'ወደ ቅርጫት ጨምር',
    'btn.buyNow': 'አሁን ግዛ',
    'btn.checkout': 'ሂሳብ ክፈል',
    'btn.back': 'ተመለስ',
    'btn.submit': 'አስገባ',
    'btn.search': 'ፈልግ',
    'label.price': 'ዋጋ',
    'label.rating': 'ደረጃ',
    'label.category': 'ምድብ',
    'label.duration': 'ቆይታ',
    'label.enrolled': 'የተመዘገቡ',

    // Categories
    'cat.music': 'ሙዚቃ',
    'cat.art': 'ስዕል እና እደ ጥበብ',
    'cat.tech': 'ቴክኖሎጂ እና ኮዲንግ',
    'cat.robotics': 'ሮቦቲክስ እና ሳይንስ',
    'cat.gaming': 'ጨዋታ እና አይ',
    'cat.photography': 'ፎቶግራፊ',
    'cat.diy': 'ዲዛይን እና እራስዎ መስራት',

    // Auth
    'auth.welcomeBack': 'እንኳን ደህና መጡ',
    'auth.loginDesc': 'ወደ ሆቢሀብ አካውንትዎ ይግቡ',
    'auth.createAccount': 'አካውንት ይክፈቱ',
    'auth.registerDesc': 'የሆቢሀብ አባል በመሆን የትምህርት ጉዞዎን ይጀምሩ',
    'auth.email': 'የኢሜል አድራሻ',
    'auth.password': 'የይለፍ ቃል',
    'auth.forgotPassword': 'የይለፍ ቃል ረስተዋል?',
    'auth.orContinue': 'ወይም በዚህ ይቀጥሉ',
    'auth.noAccount': 'አካውንት የለዎትም?',
    'auth.haveAccount': 'አካውንት አለዎት?',
    'auth.signUp': 'ይመዝገቡ',
    'auth.signIn': 'ይግቡ',
    'auth.firstName': 'ስም',
    'auth.lastName': 'የአባት ስም',

    // Dashboard
    'dash.myWorkspace': 'የእኔ የስራ ቦታ',
    'dash.enrolledhobbies': 'የተመዘገቡባቸው ክህሎቶች',
    'dash.myeventregistrations': 'የተመዘገቡባቸው ሁነቶች',
    'dash.orders': 'ትዕዛዞቼ',
    'dash.welcomeUser': 'እንኳን ደህና መጡ፣',
    'dash.learningProgress': 'የትምህርት ሂደት',
    'dash.noEnrolled': 'እስካሁን በምንም ዓይነት የትርፍ ጊዜ ማሳለፊያ ክህሎት አልተመዘገቡም።',
    'dash.browseHobbies': 'ክህሎቶችን ያስሱ',

    // Live classes / Lessons
    'lessons.title': 'በይነተገናኝ የቀጥታ ትምህርቶች',
    'lessons.subtitle': 'በሆቢሀብ እውቅና ካላቸው መምህራን ጋር በቀጥታ ክፍሎች ውስጥ ይሳተፉ።',
    'lessons.joinCall': 'ክፍሉን ይቀላቀሉ',
    'lessons.upcoming': 'የሚቀጥሉ ትምህርቶች',
    'lessons.active': 'ንቁ የቀጥታ ክፍሎች',
    'lessons.noUpcoming': 'በጊዜ ሰሌዳው ላይ ምንም የሚቀጥሉ የቀጥታ ክፍሎች የሉም።',

    // Checkout
    'check.checkoutTitle': 'ክፍያ መፈጸሚያ',
    'check.deliveryTitle': 'የማረከቢያ መረጃ',
    'check.paymentTitle': 'የክፍያ ዘዴ',
    'check.summaryTitle': 'የትዕዛዝ ማጠቃለያ',
    'check.placeOrder': 'ትዕዛዝ አስገባ',
    'check.shippingAddress': 'የማረከቢያ አድራሻ',
    'check.total': 'ጠቅላላ',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language;
    if (stored === 'en' || stored === 'am') {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const dict = translations[language] as Record<string, string>;
    const defaultDict = translations['en'] as Record<string, string>;
    return dict[key] || defaultDict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
