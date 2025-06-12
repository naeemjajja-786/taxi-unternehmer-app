// urdu-lessons.js
document.addEventListener('DOMContentLoaded', () => {
  const urduLessons = [
    { file: "urdu-lesson-1.json", name: "مسافر برداری کے بنیادی اصول اور اقسام" },
    { file: "urdu-lesson-2.json", name: "ٹیکسی/رینٹل کار اجازت نامہ اور قانونی شرائط" },
    { file: "urdu-lesson-3.json", name: "BOKraft آپریشنل قواعد اور گاڑی/ڈرائیور کی شرائط" },
    { file: "urdu-lesson-4.json", name: "ٹریفک قوانین اور حفاظتی اقدامات" },
    { file: "urdu-lesson-5.json", name: "بین الاقوامی آپریشن اور ماحولیاتی تحفظ" },
    { file: "urdu-lesson-6.json", name: "انشورنس اور قانونی ذمہ داری" },
    { file: "urdu-lesson-7.json", name: "مالیاتی تصورات اور ادائیگی کے معاملات" },
    { file: "urdu-lesson-8.json", name: "محصولات اور مالی حساب کتاب" },
    { file: "urdu-lesson-9.json", name: "قانونی امور اور کاروباری ذمہ داریاں" }
  ];
  const container = document.getElementById('lessons-list');
  let html = "";
  urduLessons.forEach((lesson, index) => {
    // Each lesson is a link to the view page with an id parameter
    html += `<a href="urdu-lesson-view.html?id=${index+1}" class="sub-btn">${lesson.name}</a>`;
  });
  container.innerHTML = html;
});
