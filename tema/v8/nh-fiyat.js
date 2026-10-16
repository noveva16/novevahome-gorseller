/* Noveva Home — Ölçüye özel perde fiyat motoru (novevahome.com sitesinden aktarıldı).
   FİYAT DEĞİŞTİRMEK İÇİN: RULES içindeki standardPricePerM2 / listPricePerM2, plise serileri için NH_EK.seriler, ayrıca NH_EK içindeki montaj/çiftli ücretleri.
   Shopify'daki ürün fiyatı yalnızca vitrin içindir; vitrin fiyatını da aynı değere güncelleyin. */
(function (root, factory) {
if (typeof module === 'object' && module.exports) module.exports = factory();
else root.PricingRules = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';
var RULES = {
plise: {
productCode: 'plise',
version: 2,
isActive: true,
confirmed: true,
standardSystemName: 'Standart Sistem',
standardPricePerM2: 749.00,
listPricePerM2: 899.00,
minBillableAreaM2: 1,
minBillableWidthCm: 0,
widthRoundingStepCm: 0,
heightRoundingStepCm: 0,
standardMaxWidthCm: 100,
maxHeightCm: 250,
minEntryWidthCm: 20,
minEntryHeightCm: 20,
jumboEnabled: false
},
stor: {
productCode: 'stor',
version: 2,
isActive: true,
confirmed: true,
standardSystemName: 'Standart Sistem',
standardPricePerM2: 600.00,
listPricePerM2: null,
jumboListPricePerM2: 890.00,
minBillableAreaM2: 0,
minBillableWidthCm: 100,
widthRoundingStepCm: 10,
heightRoundingStepCm: 10,
standardMaxWidthCm: 230,
maxHeightCm: 300,
minEntryWidthCm: 20,
minEntryHeightCm: 20,
jumboEnabled: true,
jumboSystemName: 'Jumbo Boru + Lüks Seri',
jumboPricePerM2: 740.00,
jumboFixedSurcharge: 0,
jumboMaxWidthCm: 300
},
zebra: {
productCode: 'zebra',
version: 2,
isActive: true,
confirmed: true,
standardSystemName: 'Standart Sistem',
standardPricePerM2: 790.00,
listPricePerM2: 990.00,
jumboListPricePerM2: 1290.00,
minBillableAreaM2: 0,
minBillableWidthCm: 100,
widthRoundingStepCm: 10,
heightRoundingStepCm: 10,
standardMaxWidthCm: 230,
maxHeightCm: 300,
minEntryWidthCm: 20,
minEntryHeightCm: 20,
jumboEnabled: true,
jumboSystemName: 'Jumbo Boru + Lüks Seri',
jumboPricePerM2: 1040.00,
jumboFixedSurcharge: 0,
jumboMaxWidthCm: 300
},
ahsap_jaluzi: {
productCode: 'ahsap_jaluzi',
version: 2,
isActive: true,
confirmed: true,
standardSystemName: 'Standart Sistem',
standardPricePerM2: 2490.00,
listPricePerM2: 2990.00,
minBillableAreaM2: 0,
minBillableWidthCm: 100,
widthRoundingStepCm: 10,
heightRoundingStepCm: 10,
standardMaxWidthCm: 230,
maxHeightCm: 300,
minEntryWidthCm: 20,
minEntryHeightCm: 20,
jumboEnabled: false
}
};
function unconfirmedProducts() {
return Object.keys(RULES).filter(function (k) { return !RULES[k].confirmed; });
}
return { RULES: RULES, get: function (code) { return RULES[code]; }, unconfirmedProducts: unconfirmedProducts };
});
(function (root, factory) {
if (typeof module === 'object' && module.exports) module.exports = factory();
else root.Pricing = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';
var ERROR_MESSAGES = {
INVALID_WIDTH: 'Lütfen geçerli bir EN ölçüsü giriniz.',
INVALID_HEIGHT: 'Lütfen geçerli bir BOY ölçüsü giriniz.',
INVALID_QUANTITY: 'Adet en az 1 olmalıdır.',
MAX_WIDTH_EXCEEDED: 'Bu ürün seçilen EN ölçüsünde üretilememektedir.',
MAX_HEIGHT_EXCEEDED: 'Bu ürün için maksimum BOY ölçüsü aşıldı.',
JUMBO_DISABLED: 'Bu ölçü için jumbo sistem şu anda satışa kapalıdır; bize ulaşın.',
JUMBO_MAX_WIDTH_EXCEEDED: 'Bu ölçü için özel teklif alınması gerekmektedir.',
JUMBO_PRICE_UNDEFINED: 'Bu ölçü için fiyat tanımlı değildir. Lütfen bize ulaşın.',
PRICE_CHANGED: 'Fiyat güncellendi. Yeni toplamı kontrol ediniz.',
PRODUCT_INACTIVE: 'Bu ürün şu anda satışta değildir.',
MIN_WIDTH_BELOW: 'Lütfen geçerli bir EN ölçüsü giriniz (en az 20 cm).',
MIN_HEIGHT_BELOW: 'Lütfen geçerli bir BOY ölçüsü giriniz (en az 20 cm).'
};
function PricingError(code, detail) {
var e = new Error(code);
e.code = code;
e.userMessage = ERROR_MESSAGES[code] || 'Ölçü doğrulanamadı.';
if (code === 'MAX_WIDTH_EXCEEDED' && detail && detail.standardMaxWidthCm) {
e.userMessage = 'Bu ürün için maksimum EN ölçüsü ' + detail.standardMaxWidthCm + ' cm’dir.';
}
if (code === 'MAX_HEIGHT_EXCEEDED' && detail && detail.maxHeightCm) {
e.userMessage = 'Bu ürün için maksimum BOY ölçüsü ' + detail.maxHeightCm + ' cm’dir.';
}
if (detail) e.detail = detail;
return e;
}
function normalizeNumber(value) {
if (typeof value === 'number') return value;
if (value === null || value === undefined) return NaN;
var s = String(value).trim();
if (s === '') return NaN;
s = s.replace(/\s/g, '').replace(',', '.');
if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
return parseFloat(s);
}
function money(value) {
return Math.round((value + Number.EPSILON) * 100) / 100;
}
function roundUpToStep(value, step) {
if (!step || step <= 0) return value;
var q = value / step;
var r = Math.round(q);
if (Math.abs(q - r) < 1e-9) q = r;
return Math.ceil(q) * step;
}
function formatTRY(value, withSymbol) {
var s = Number(value).toLocaleString('tr-TR', {
minimumFractionDigits: 2, maximumFractionDigits: 2
});
return withSymbol === false ? s : s + ' ₺';
}
function formatCm(value) {
var n = Number(value);
var s = (Math.abs(n - Math.round(n)) < 1e-9)
? String(Math.round(n))
: n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
return s;
}
function calculatePrice(input) {
var rule = input.rule;
if (!rule) throw PricingError('PRODUCT_INACTIVE');
if (rule.isActive === false) throw PricingError('PRODUCT_INACTIVE');
var widthCm = normalizeNumber(input.widthCm);
var heightCm = normalizeNumber(input.heightCm);
var quantity = normalizeNumber(input.quantity);
if (!isFinite(widthCm) || widthCm <= 0) throw PricingError('INVALID_WIDTH');
if (!isFinite(heightCm) || heightCm <= 0) throw PricingError('INVALID_HEIGHT');
if (!isFinite(quantity) || !Number.isInteger(quantity) || quantity < 1) {
throw PricingError('INVALID_QUANTITY');
}
if (rule.maxHeightCm !== null && rule.maxHeightCm !== undefined && heightCm > rule.maxHeightCm) {
throw PricingError('MAX_HEIGHT_EXCEEDED', { maxHeightCm: rule.maxHeightCm });
}
if (rule.minEntryWidthCm && widthCm < rule.minEntryWidthCm) {
throw PricingError('MIN_WIDTH_BELOW', { minEntryWidthCm: rule.minEntryWidthCm });
}
if (rule.minEntryHeightCm && heightCm < rule.minEntryHeightCm) {
throw PricingError('MIN_HEIGHT_BELOW', { minEntryHeightCm: rule.minEntryHeightCm });
}
var exceedsStandardWidth =
rule.standardMaxWidthCm !== null &&
rule.standardMaxWidthCm !== undefined &&
widthCm > rule.standardMaxWidthCm;
var pricingMode = 'standard';
var systemName = rule.standardSystemName || 'Standart Sistem';
var pricePerM2 = rule.standardPricePerM2;
var fixedSurcharge = 0;
if (exceedsStandardWidth) {
if (!rule.jumboEnabled) {
throw PricingError('MAX_WIDTH_EXCEEDED', { standardMaxWidthCm: rule.standardMaxWidthCm });
}
if (rule.jumboMaxWidthCm === null || rule.jumboMaxWidthCm === undefined) {
throw PricingError('JUMBO_MAX_WIDTH_EXCEEDED', { reason: 'JUMBO_MAX_WIDTH_NOT_SET' });
}
if (widthCm > rule.jumboMaxWidthCm) {
throw PricingError('JUMBO_MAX_WIDTH_EXCEEDED', { jumboMaxWidthCm: rule.jumboMaxWidthCm });
}
if (rule.jumboPricePerM2 === null || rule.jumboPricePerM2 === undefined || !(rule.jumboPricePerM2 > 0)) {
throw PricingError('JUMBO_PRICE_UNDEFINED');
}
pricingMode = 'jumbo';
systemName = rule.jumboSystemName || 'Jumbo Boru + Lüks Seri';
pricePerM2 = rule.jumboPricePerM2;
fixedSurcharge = rule.jumboFixedSurcharge || 0;
}
if (!(pricePerM2 > 0)) throw PricingError('PRODUCT_INACTIVE');
var roundedWidthCm = roundUpToStep(widthCm, rule.widthRoundingStepCm);
var roundedHeightCm = roundUpToStep(heightCm, rule.heightRoundingStepCm);
var billableWidthCm = Math.max(roundedWidthCm, rule.minBillableWidthCm || 0);
var actualAreaM2 = (widthCm * heightCm) / 10000;
var calculatedAreaM2 = (billableWidthCm * roundedHeightCm) / 10000;
var billableAreaM2 = Math.max(calculatedAreaM2, rule.minBillableAreaM2 || 0);
var unitPrice = money(billableAreaM2 * pricePerM2 + fixedSurcharge);
var totalPrice = money(unitPrice * quantity);
var listPricePerM2 = null;
if (pricingMode === 'jumbo') {
if (rule.jumboListPricePerM2 && rule.jumboListPricePerM2 > pricePerM2) listPricePerM2 = rule.jumboListPricePerM2;
} else {
if (rule.listPricePerM2 && rule.listPricePerM2 > pricePerM2) listPricePerM2 = rule.listPricePerM2;
}
var hasDiscount = listPricePerM2 != null;
var listUnitPrice = hasDiscount ? money(billableAreaM2 * listPricePerM2 + fixedSurcharge) : null;
var listTotalPrice = hasDiscount ? money(listUnitPrice * quantity) : null;
var discountPercent = hasDiscount ? Math.round((1 - pricePerM2 / listPricePerM2) * 100) : 0;
var savings = hasDiscount ? money(listTotalPrice - totalPrice) : 0;
var result = {
productCode: rule.productCode,
pricingMode: pricingMode,
systemName: systemName,
enteredWidthCm: widthCm,
enteredHeightCm: heightCm,
billableWidthCm: billableWidthCm,
billableHeightCm: roundedHeightCm,
actualAreaM2: Number(actualAreaM2.toFixed(4)),
billableAreaM2: Number(billableAreaM2.toFixed(4)),
pricePerM2: pricePerM2,
fixedSurcharge: fixedSurcharge,
quantity: quantity,
unitPrice: unitPrice,
totalPrice: totalPrice,
hasDiscount: hasDiscount,
listPricePerM2: listPricePerM2,
listUnitPrice: listUnitPrice,
listTotalPrice: listTotalPrice,
discountPercent: discountPercent,
savings: savings,
currency: 'TRY',
ruleVersion: rule.version || 1
};
result.explanation = buildExplanation(result, rule);
return result;
}
function buildExplanation(r, rule) {
var lines = [];
if (rule.widthRoundingStepCm > 0 && r.billableWidthCm !== r.enteredWidthCm) {
if (rule.minBillableWidthCm &&
roundUpToStep(r.enteredWidthCm, rule.widthRoundingStepCm) < rule.minBillableWidthCm) {
lines.push('EN ölçünüz ' + formatCm(r.enteredWidthCm) + ' cm olduğu için, bu üründe minimum ' +
formatCm(rule.minBillableWidthCm) + ' cm EN üzerinden fiyatlandırıldı.');
} else {
lines.push('EN ölçünüz ' + formatCm(r.enteredWidthCm) + ' cm olduğu için ' +
formatCm(r.billableWidthCm) + ' cm olarak fiyatlandırıldı.');
}
}
if (rule.heightRoundingStepCm > 0 && r.billableHeightCm !== r.enteredHeightCm) {
lines.push('BOY ölçünüz ' + formatCm(r.enteredHeightCm) + ' cm olduğu için ' +
formatCm(r.billableHeightCm) + ' cm olarak fiyatlandırıldı.');
}
if (r.pricingMode === 'jumbo') {
lines.push('EN ölçünüz ' + formatCm(rule.standardMaxWidthCm) +
' cm üzerinde olduğu için ' + r.systemName + ' uygulandı.');
}
if (r.fixedSurcharge > 0) {
lines.push('Jumbo sistem sabit ek ücreti ' + formatTRY(r.fixedSurcharge) + ' olarak eklendi.');
}
return lines;
}
function tryCalculate(input) {
try {
return { ok: true, result: calculatePrice(input) };
} catch (e) {
return {
ok: false,
code: e.code || 'UNKNOWN',
message: e.userMessage || 'Ölçü doğrulanamadı.',
detail: e.detail || null
};
}
}
return {
calculatePrice: calculatePrice,
tryCalculate: tryCalculate,
roundUpToStep: roundUpToStep,
normalizeNumber: normalizeNumber,
money: money,
formatTRY: formatTRY,
formatCm: formatCm,
ERROR_MESSAGES: ERROR_MESSAGES
};
});
window.NH_EK = {
/* PLİSE KUMAŞ SERİLERİ — m2: satış fiyatı (TL/m²), liste: üstü çizili fiyat. Sıra ekranda görünen sıradır. */
seriler: [
{ kod: 'standart', ad: 'Standart Plise', etiket: '', aciklama: 'Işığı yumuşak süzen klasik plise kumaş.', m2: 749, liste: 899 },
{ kod: 'venus', ad: 'Venüs Serisi', etiket: '', aciklama: 'Venüs serisi plise kumaş.', m2: 900, liste: 1300 },
{ kod: 'dark', ad: 'Dark Serisi', etiket: '%85 karartma', aciklama: 'Güneşi büyük ölçüde keser; oda loş kalır.', m2: 1300, liste: 2000 },
{ kod: 'blackout', ad: 'Blackout Plise', etiket: '%100 karartma', aciklama: 'Işık geçirmeyen kumaş; yatak odası ve uyku için ideal.', m2: 1590, liste: 2000 },
{ kod: 'honeycomb', ad: 'Honeycomb (Bal Peteği)', etiket: '%100 karartma', aciklama: 'Bal peteği hücreli yapı; tam karartma ve daha yüksek ısı yalıtımı.', m2: 1800, liste: 2500 }
],
yapistirmaMontajUcreti: 200,
profilRenkleri: ['Beyaz', 'Gri', 'Antrasit', 'Siyah', 'Ahşap'],
montajlar: [
{ kod: 'kancali', ad: 'Kancalı Montaj', ucret: 0, aciklama: 'Cam balkon profiline kanca ile; delme gerektirmez.' },
{ kod: 'vidali', ad: 'Vidalı Montaj', ucret: 0, aciklama: 'Duvara, tavana veya pimapen kasaya vidalı. En sağlam çözüm.' },
{ kod: 'yapistirmali', ad: 'Yapıştırmalı Montaj', ucret: 200, aciklama: 'Güçlü çift taraflı bant ile delmeden montaj.' }
],
ciftli: [
{ kod: 'tekli', ad: 'Tekli Sistem', ekM2: 0, aciklama: 'Standart tek katlı sistem.' },
{ kod: 'ciftli', ad: 'Çiftli Sistem (Gece / Gündüz)', ekM2: 1020, aciklama: 'Gündüz tül, gece perde. m² fiyatına tül (+800 ₺) ve sistem farkı (+220 ₺) eklenir.' }
],
whatsapp: '905443028616'
};
