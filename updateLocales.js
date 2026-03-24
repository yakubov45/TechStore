const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'client/src/locales');
const languages = ['en', 'uz', 'ru'];

const additions = {
    en: {
        admin: {
            table: {
                product: "Product",
                category: "Category",
                brand: "Brand",
                price: "Price",
                stock: "Stock",
                status: "Status",
                actions: "Actions",
                customer: "Customer",
                date: "Date",
                payment: "Payment",
                delivery: "Delivery",
                total: "Total"
            },
            status: {
                pending: "Pending",
                processing: "Processing",
                delivered: "Delivered",
                cancelled: "Cancelled"
            },
            filters: {
                allPayments: "All Payments",
                online: "Online",
                cash: "Cash",
                allDelivery: "All Delivery",
                pickup: "Pickup",
                standard: "Standard Delivery",
                allStatuses: "All Statuses"
            },
            discountHint: "Applying a discount will set the current price as the \"Compare Price\" (Original Price) if not already set. Make sure to remove discounts before applying new ones to avoid stacking issues or incorrect base prices.",
            dailyDiscount: "Daily / temporary discount",
            removeDiscount: "Remove Discount",
            applyDiscount: "Apply Discount",
            discountType: "Discount Type",
            discountValue: "Discount Value",
            targetProducts: "Target Products"
        },
        profile: {
            account: "My Account",
            profile: "Profile",
            orders: "Orders",
            wishlist: "Wishlist",
            logout: "Logout",
            profileInfo: "Profile Information",
            name: "Name",
            email: "Email",
            phone: "Phone",
            memberSince: "Member Since",
            notVerified: "Not verified",
            notProvided: "Not provided",
            edit: "Edit",
            save: "Save",
            cancel: "Cancel",
            sendSmsCode: "Send SMS Code"
        },
        products: {
            wouldRecommend: "98% would recommend"
        }
    },
    uz: {
        admin: {
            table: {
                product: "Mahsulot",
                category: "Kategoriya",
                brand: "Brend",
                price: "Narx",
                stock: "Zaxira",
                status: "Holati",
                actions: "Amallar",
                customer: "Mijoz",
                date: "Sana",
                payment: "To'lov",
                delivery: "Yetkazib berish",
                total: "Jami"
            },
            status: {
                pending: "Kutilmoqda",
                processing: "Jarayonda",
                delivered: "Yetkazib berildi",
                cancelled: "Bekor qilingan"
            },
            filters: {
                allPayments: "Barcha to'lovlar",
                online: "Onlayn",
                cash: "Naqd pul",
                allDelivery: "Barcha yetkazib berishlar",
                pickup: "Olib ketish",
                standard: "Standart etkazib berish",
                allStatuses: "Barcha holatlar"
            },
            discountHint: "Chegirmani qo'llash joriy narxni \"Taqqoslash narxi\" (Asl narx) sifatida o'rnatadi. Noto'g'ri asosiy narxlar paydo bo'lishining oldini olish uchun yangi chegirmalarni qo'llashdan oldin eskilarni olib tashlang.",
            dailyDiscount: "Kunlik / vaqtinchalik chegirma",
            removeDiscount: "Chegirmani olib tashlash",
            applyDiscount: "Chegirmani qo'llash",
            discountType: "Chegirma turi",
            discountValue: "Chegirma qiymati",
            targetProducts: "Maqsadli mahsulotlar"
        },
        profile: {
            account: "Mening hisobim",
            profile: "Profil",
            orders: "Buyurtmalar",
            wishlist: "Saralanganlar",
            logout: "Chiqish",
            profileInfo: "Profil ma'lumotlari",
            name: "Ism",
            email: "Elektron pochta",
            phone: "Telefon",
            memberSince: "A'zo bo'lgan sana",
            notVerified: "Tasdiqlanmagan",
            notProvided: "Kiritilmagan",
            edit: "Tahrirlash",
            save: "Saqlash",
            cancel: "Bekor qilish",
            sendSmsCode: "SMS kod yuborish"
        },
        products: {
            wouldRecommend: "98% mijozlar tavsiya qiladi"
        }
    },
    ru: {
        admin: {
            table: {
                product: "Товар",
                category: "Категория",
                brand: "Бренд",
                price: "Цена",
                stock: "Запас",
                status: "Статус",
                actions: "Действия",
                customer: "Клиент",
                date: "Дата",
                payment: "Оплата",
                delivery: "Доставка",
                total: "Итого"
            },
            status: {
                pending: "В ожидании",
                processing: "В обработке",
                delivered: "Доставлен",
                cancelled: "Отменен"
            },
            filters: {
                allPayments: "Все платежи",
                online: "Онлайн",
                cash: "Наличными",
                allDelivery: "Вся доставка",
                pickup: "Самовывоз",
                standard: "Стандартная доставка",
                allStatuses: "Все статусы"
            },
            discountHint: "Применение скидки установит текущую цену в качестве \"Цены для сравнения\" (Оригинальной цены). Обязательно удаляйте старые скидки перед применением новых, чтобы избежать неправильных базовых цен.",
            dailyDiscount: "Ежедневная / временная скидка",
            removeDiscount: "Удалить скидку",
            applyDiscount: "Применить скидку",
            discountType: "Тип скидки",
            discountValue: "Значение скидки",
            targetProducts: "Целевые продукты"
        },
        profile: {
            account: "Мой аккаунт",
            profile: "Профиль",
            orders: "Заказы",
            wishlist: "Избранное",
            logout: "Выйти",
            profileInfo: "Информация профиля",
            name: "Имя",
            email: "Почта",
            phone: "Телефон",
            memberSince: "С нами с",
            notVerified: "Не подтвержден",
            notProvided: "Не указан",
            edit: "Изменить",
            save: "Сохранить",
            cancel: "Отмена",
            sendSmsCode: "Отправить SMS код"
        },
        products: {
            wouldRecommend: "98% рекомендуют"
        }
    }
};

function deepMerge(target, source) {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], deepMerge(target[key], source[key]));
        }
    }
    Object.assign(target || {}, source);
    return target;
}

languages.forEach(lang => {
    const filePath = path.join(localesPath, `${lang}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const merged = deepMerge(data, additions[lang]);
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 4));
    console.log(`Updated ${lang}.json`);
});
