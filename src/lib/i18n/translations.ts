import type { Language } from '../typing/types';

export const translations = {
  en: {
    // Header & Brand
    appTitle: 'TypeMaster',
    appSubtitle: 'Practice touch typing with educational content',
    tagline: 'Master touch typing with structured lessons and educational content. Learn while you type!',
    
    // Main Menu
    menuTitle: 'Main Menu',
    beginnerLessonsTitle: 'Beginner Lessons',
    beginnerLessonsDesc: 'Start with J, F, and Space, then learn a few new keys at a time.',
    practiceTopicsTitle: 'Practice Topics',
    practiceTopicsDesc: 'Type educational content from biology, psychology, technology, and more.',
    customTextTitle: 'Custom Text',
    customTextDesc: 'Paste your own text or upload files (.txt, .pdf, .docx) to practice.',
    
    // Progress Card
    yourProgress: 'Your Progress',
    sessionsCompleted: 'sessions completed',
    bestWpm: 'Best WPM',
    avgAccuracy: 'Avg Accuracy',
    minutesPracticed: 'Minutes Practiced',
    lessonsDone: 'Lessons Done',
    lessonsProgress: 'Lessons Progress',
    pressAnyKey: 'Press any key to start typing once you select a mode',
    
    // Selectors
    selectLesson: 'Select a Lesson',
    selectCategory: 'Select a Topic',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    letters: 'Letters',
    words: 'Words',
    sentences: 'Sentences',
    paragraph: 'Paragraph',
    completed: 'Completed',
    startLesson: 'Start Lesson',
    startPractice: 'Start Practice',
    paragraphs: 'paragraphs',
    
    // Custom Input
    customTextHeader: 'Custom Text Input',
    pasteText: 'Paste Your Text',
    pasteTextPlaceholder: 'Paste or type the text you want to practice typing here...',
    uploadFile: 'Upload File',
    uploadFileDesc: 'Supported formats: .txt, .pdf, .docx',
    dragAndDrop: 'Click to upload or drag & drop',
    textSegments: 'Text Segments',
    splitBy: 'Split text into practice segments',
    segmentByParagraph: 'By Paragraph',
    segmentBySentence: 'By Sentence',
    startTyping: 'Start Typing',
    clearText: 'Clear',
    
    // Typing View & Header
    lesson: 'Lesson',
    topic: 'Topic',
    custom: 'Custom Text',
    linesCompleted: 'lines completed',
    linesRemaining: 'lines remaining',
    
    // Navigation & Buttons
    back: 'Back',
    home: 'Home',
    next: 'Next',
    previous: 'Previous',
    restart: 'Restart',
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    
    // Stats Panel
    wpm: 'WPM',
    accuracy: 'Accuracy',
    time: 'Time',
    errors: 'Errors',
    characters: 'Characters',
    
    // Timer Settings
    timerSettings: 'Timer Settings',
    noTimer: 'No Timer',
    oneMin: '1 Minute',
    fiveMin: '5 Minutes',
    customTimer: 'Custom',
    seconds: 'seconds',
    saveTimer: 'Save Settings',
    
    // Results Screen
    sessionComplete: 'Session Complete!',
    greatJob: 'Great job completing this typing session.',
    wpmAchieved: 'Words Per Minute',
    accuracyAchieved: 'Accuracy Rate',
    timeElapsed: 'Time Elapsed',
    totalErrors: 'Total Errors',
    tryAgain: 'Try Again',
    returnHome: 'Return to Menu',
    nextExercise: 'Next Exercise',
    
    // Virtual Keyboard
    space: 'Space',
    shift: 'Shift',
    enter: 'Enter',
    ctrl: 'Ctrl',
    alt: 'Alt',
  },
  ar: {
    // Header & Brand
    appTitle: 'تايب ماستر',
    appSubtitle: 'تمارين الكتابة السريعة باللمس مع محتوى تعليمي',
    tagline: 'أتقن الكتابة باللمس من خلال دروس منظمة ومحتوى تعليمي ثري. تعلم أثناء الكتابة!',
    
    // Main Menu
    menuTitle: 'القائمة الرئيسية',
    beginnerLessonsTitle: 'دروس المبتدئين',
    beginnerLessonsDesc: 'ابدأ من الأساسيات. تعلم صف الارتكاز ثم التوسع لباقي المفاتيح.',
    practiceTopicsTitle: 'مواضيع للممارسة',
    practiceTopicsDesc: 'اكتب نصوصاً تعليمية في الأحياء، النفس، التكنولوجيا وغيرها.',
    customTextTitle: 'نص مخصص',
    customTextDesc: 'الصق نصك الخاص أو قم بتحميل ملفات (.txt, .pdf, .docx) للممارسة.',
    
    // Progress Card
    yourProgress: 'تقدمك الشخصي',
    sessionsCompleted: 'جلسة مكتملة',
    bestWpm: 'أفضل سرعة (ك/د)',
    avgAccuracy: 'متوسط الدقة',
    minutesPracticed: 'دقائق التمرين',
    lessonsDone: 'الدروس المنجزة',
    lessonsProgress: 'نسبة إنجاز الدروس',
    pressAnyKey: 'اضغط على أي مفتاح لبدء الكتابة عند اختيار وضع التمرين',
    
    // Selectors
    selectLesson: 'اختر درساً',
    selectCategory: 'اختر موضوعاً',
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
    letters: 'أحرف',
    words: 'كلمات',
    sentences: 'جمل',
    paragraph: 'فقرات',
    completed: 'مكتمل',
    startLesson: 'بدء الدرس',
    startPractice: 'بدء التمرين',
    paragraphs: 'فقرات',
    
    // Custom Input
    customTextHeader: 'إدخال نص مخصص',
    pasteText: 'الصق النص الخاص بك',
    pasteTextPlaceholder: 'الصق أو اكتب النص الذي تريد التمرين عليه هنا...',
    uploadFile: 'تحميل ملف',
    uploadFileDesc: 'الصيغ المدعومة: .txt, .pdf, .docx',
    dragAndDrop: 'انقر للتحميل أو اسحب الملف هنا',
    textSegments: 'تقسيم النص',
    splitBy: 'تقسيم النص إلى مقاطع للتمرين',
    segmentByParagraph: 'حسب الفقرات',
    segmentBySentence: 'حسب الجمل',
    startTyping: 'بدء الكتابة',
    clearText: 'مسح',
    
    // Typing View & Header
    lesson: 'درس',
    topic: 'موضوع',
    custom: 'نص مخصص',
    linesCompleted: 'سطر مكتمل',
    linesRemaining: 'سطر متبقي',
    
    // Navigation & Buttons
    back: 'رجوع',
    home: 'الرئيسية',
    next: 'التالي',
    previous: 'السابق',
    restart: 'إعادة',
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    
    // Stats Panel
    wpm: 'كلمة/دقيقة',
    accuracy: 'الدقة',
    time: 'الوقت',
    errors: 'الأخطاء',
    characters: 'الأحرف',
    
    // Timer Settings
    timerSettings: 'إعدادات المؤقت',
    noTimer: 'بدون مؤقت',
    oneMin: 'دقيقة واحدة',
    fiveMin: '٥ دقائق',
    customTimer: 'مخصص',
    seconds: 'ثانية',
    saveTimer: 'حفظ الإعدادات',
    
    // Results Screen
    sessionComplete: 'اكتملت الجلسة!',
    greatJob: 'عمل رائع! لقد أنهيت جلسة الكتابة بنجاح.',
    wpmAchieved: 'السرعة (كلمة/دقيقة)',
    accuracyAchieved: 'نسبة الدقة',
    timeElapsed: 'الوقت المستغرق',
    totalErrors: 'إجمالي الأخطاء',
    tryAgain: 'إعادة المحاولة',
    returnHome: 'العودة للقائمة',
    nextExercise: 'التمرين التالي',
    
    // Virtual Keyboard
    space: 'مسافة',
    shift: 'Shift',
    enter: 'إدخال',
    ctrl: 'Ctrl',
    alt: 'Alt',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
