export const reservationTemplates = [
  {
    title: "رسمی و حرفه‌ای",
    text: "سلام {client_name} عزیز\nنوبت شما با موفقیت ثبت شد!\nتاریخ: {date}\nساعت: {time}\nخدمات: {services}\n\nممنون از اعتمادتون",
    length: 3,
  },
  {
    title: "دوستانه و گرم",
    text: "سلام {client_name} جان\nنوبتت ثبت شد عزیزم!\n{date} ساعت {time} منتظرتیم\nخدمات: {services}\n\nبه موقع بیا که دلمون برات تنگ میشه",
    length: 3,
  },
  {
    title: "کوتاه و مفید",
    text: "نوبت شما ثبت شد!\n{date} - {time}\nخدمات: {services}\n\nمنتظر حضورتون هستیم",
    length: 2,
  },
  {
    title: "خوش‌آمدگویی گرم",
    text: "خوش اومدی {client_name} عزیز\nنوبتت ثبت شد:\n{date} ساعت {time}\nخدمات: {services}\n\nمنتظرت هستیم",
    length: 2,
  },
];

export const reminderTemplates = [
  {
    title: "یادآوری مودبانه",
    text: "سلام {client_name} عزیز\nیادآوری نوبت:\nامروز ساعت {time} منتظر شما هستیم\nلطفاً سر وقت تشریف بیاورید",
    length: 2,
  },
  {
    title: "یادآوری دوستانه",
    text: "سلام {client_name} جان\nامروز ساعت {time} نوبتته!\nاگه نمی‌تونی بیای حتما خبر بده\nدلمون برات تنگ شده",
    length: 2,
  },
  {
    title: "یادآوری عاشقانه",
    text: "عزیزم {client_name}\nامروز ساعت {time} می‌بینمت\nدلم برات تنگ شده بود\nمنتظرم",
    length: 2,
  },
  {
    title: "یادآوری با طنز",
    text: "سلام {client_name}!\nساعت {time} نوبتته\nاگه نیای آرایشگرمون دلش می‌گیره\nبیا که منتظرتیم",
    length: 2,
  },
];