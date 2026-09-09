"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInvoiceEmail = buildInvoiceEmail;
exports.buildInvoicePdf = buildInvoicePdf;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const BRAND = {
    navy: "#07111f",
    panel: "#101c31",
    blue: "#2f7cff",
    cyan: "#4ee6dd",
    text: "#182338",
    muted: "#63718a",
    border: "#dce4ef",
};
const logoPath = path_1.default.join(process.cwd(), "public", "logo.png");
const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const money = (amount, currency) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
const paidDate = (value) => new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
const getItems = (items) => Array.isArray(items)
    ? items.map((item) => ({
        name: String(item?.name ?? "Bloxhop digital item"),
        quantity: Math.max(1, Number(item?.quantity) || 1),
        price: Number(item?.price) || 0,
    }))
    : [];
function buildInvoiceEmail(order) {
    const items = getItems(order.items);
    const rows = items
        .map((item) => `<tr>
        <td style="padding:15px 0;border-bottom:1px solid #e8edf4;color:#152239">
          <strong>${esc(item.name)}</strong><br>
          <span style="font-size:13px;color:#718096">Quantity ${item.quantity}</span>
        </td>
        <td align="right" style="padding:15px 0;border-bottom:1px solid #e8edf4;color:#152239">
          <strong>${esc(money(item.price * item.quantity, order.currency))}</strong>
        </td>
      </tr>`)
        .join("");
    return `<div style="margin:0;padding:38px 14px;background:#07111f;font-family:Arial,Helvetica,sans-serif;color:#152239">
    <div style="max-width:620px;margin:0 auto">
      <div style="padding:0 18px 20px;color:#ffffff">
        <img src="cid:bloxhop-logo" width="46" height="46" alt="Bloxhop" style="vertical-align:middle;border-radius:12px;margin-right:12px;object-fit:contain;background:#111d33">
        <span style="vertical-align:middle;font-size:22px;font-weight:800;letter-spacing:.3px">BLOXHOP</span>
        <span style="vertical-align:middle;margin-left:8px;font-size:10px;font-weight:700;letter-spacing:1.8px;color:#7dd3fc">ONLINE STORE</span>
      </div>
      <div style="background:#ffffff;border-radius:18px;overflow:hidden">
        <div style="padding:28px 30px 24px;background:linear-gradient(135deg,#f8fbff,#edf5ff);border-bottom:1px solid #dbeafe">
          <p style="margin:0 0 7px;font-size:13px;font-weight:700;letter-spacing:1.2px;color:#2374e1">PAYMENT CONFIRMED</p>
          <h1 style="margin:0;color:#13213a;font-size:31px;line-height:1.15">Your Bloxhop invoice</h1>
          <p style="margin:11px 0 0;color:#5f6d82;font-size:14px">Thanks for your purchase. Your digital order is now in the fulfillment queue.</p>
        </div>
        <div style="padding:28px 30px 32px">
          <table width="100%" cellspacing="0" cellpadding="0" style="font-size:14px">
            <tr><td style="color:#6b7789">Amount paid</td><td align="right" style="font-size:23px;color:#13213a"><strong>${esc(money(order.amount, order.currency))}</strong></td></tr>
            <tr><td style="padding-top:14px;color:#6b7789">Invoice</td><td align="right" style="padding-top:14px;color:#13213a"><strong>BLOX-${order.id}</strong></td></tr>
            <tr><td style="padding-top:9px;color:#6b7789">Order number</td><td align="right" style="padding-top:9px;color:#13213a">#${order.id}</td></tr>
            <tr><td style="padding-top:9px;color:#6b7789">Payment method</td><td align="right" style="padding-top:9px;color:#13213a">PayPal</td></tr>
            <tr><td style="padding-top:9px;color:#6b7789">Paid on</td><td align="right" style="padding-top:9px;color:#13213a">${esc(paidDate(order.paidAt))}</td></tr>
            <tr><td style="padding-top:9px;color:#6b7789">Roblox username</td><td align="right" style="padding-top:9px;color:#13213a">${esc(order.username || "Not provided")}</td></tr>
          </table>
          <h2 style="margin:30px 0 4px;font-size:18px;color:#13213a">Order summary</h2>
          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px">${rows || '<tr><td style="padding:15px 0;color:#718096">Your Bloxhop order</td></tr>'}</table>
          <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;font-size:16px"><tr><td style="color:#13213a"><strong>Total paid</strong></td><td align="right" style="color:#13213a"><strong>${esc(money(order.amount, order.currency))}</strong></td></tr></table>
          <div style="margin-top:28px;padding:16px 18px;border-radius:12px;background:#f1f8ff;color:#46627f;font-size:13px;line-height:1.55">Keep this invoice for your records. For help with your order, email <a href="mailto:support@bloxhop.site" style="color:#1976d2;font-weight:700;text-decoration:none">support@bloxhop.site</a>.</div>
        </div>
      </div>
      <p style="margin:20px 0 0;text-align:center;color:#94a3b8;font-size:12px">Bloxhop Online Store · Secure digital delivery</p>
    </div>
  </div>`;
}
async function buildInvoicePdf(order) {
    const document = new pdfkit_1.default({ size: "A4", margin: 0, info: { Title: `Bloxhop Invoice BLOX-${order.id}`, Author: "Bloxhop Online Store" } });
    const chunks = [];
    document.on("data", (chunk) => chunks.push(chunk));
    const completed = new Promise((resolve, reject) => {
        document.on("end", () => resolve(Buffer.concat(chunks)));
        document.on("error", reject);
    });
    document.rect(0, 0, 595.28, 841.89).fill("#f6f9fd");
    document.rect(0, 0, 595.28, 143).fill(BRAND.navy);
    if (fs_1.default.existsSync(logoPath)) {
        document.image(logoPath, 46, 42, { fit: [55, 55], align: "center", valign: "center" });
    }
    else {
        document.roundedRect(46, 44, 52, 52, 12).fill(BRAND.blue);
        document.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text("BH", 55, 59);
    }
    document.fillColor("#ffffff").font("Helvetica-Bold").fontSize(21).text("BLOXHOP", 114, 54);
    document.fillColor("#84dffc").font("Helvetica-Bold").fontSize(8).text("ONLINE STORE", 115, 80, { characterSpacing: 1.7 });
    document.fillColor("#b6c5d8").font("Helvetica").fontSize(10).text("PAYMENT RECEIPT", 425, 62, { width: 124, align: "right", characterSpacing: 1 });
    document.roundedRect(40, 112, 515, 670, 18).fill("#ffffff");
    document.fillColor(BRAND.blue).font("Helvetica-Bold").fontSize(9).text("PAYMENT CONFIRMED", 72, 158, { characterSpacing: 1.2 });
    document.fillColor(BRAND.text).font("Helvetica-Bold").fontSize(27).text("Your Bloxhop invoice", 72, 177);
    document.fillColor(BRAND.muted).font("Helvetica").fontSize(11).text("Thank you for your purchase. Your digital order is now in the fulfillment queue.", 72, 215, { width: 330, lineGap: 3 });
    document.roundedRect(403, 158, 116, 80, 12).fill("#eef6ff");
    document.fillColor(BRAND.muted).font("Helvetica-Bold").fontSize(8).text("AMOUNT PAID", 414, 173, { characterSpacing: 0.8 });
    document.fillColor(BRAND.text).font("Helvetica-Bold").fontSize(18).text(money(order.amount, order.currency), 414, 190, { width: 94, align: "right" });
    document.strokeColor(BRAND.border).lineWidth(1).moveTo(72, 264).lineTo(523, 264).stroke();
    const details = [
        ["Invoice", `BLOX-${order.id}`],
        ["Order number", `#${order.id}`],
        ["Payment method", "PayPal"],
        ["Paid on", paidDate(order.paidAt)],
        ["Roblox username", order.username || "Not provided"],
    ];
    let y = 285;
    for (const [label, value] of details) {
        document.fillColor(BRAND.muted).font("Helvetica").fontSize(10).text(label, 72, y);
        document.fillColor(BRAND.text).font("Helvetica-Bold").fontSize(10).text(value, 297, y, { width: 226, align: "right" });
        y += 25;
    }
    document.fillColor(BRAND.text).font("Helvetica-Bold").fontSize(16).text("Order summary", 72, 425);
    document.strokeColor(BRAND.border).moveTo(72, 453).lineTo(523, 453).stroke();
    y = 471;
    const items = getItems(order.items);
    for (const item of items.length ? items : [{ name: "Your Bloxhop digital order", quantity: 1, price: order.amount }]) {
        document.fillColor(BRAND.text).font("Helvetica-Bold").fontSize(11).text(item.name, 72, y, { width: 300 });
        document.fillColor(BRAND.muted).font("Helvetica").fontSize(9).text(`Quantity ${item.quantity}`, 72, y + 17);
        document.fillColor(BRAND.text).font("Helvetica-Bold").fontSize(11).text(money(item.price * item.quantity, order.currency), 392, y + 4, { width: 131, align: "right" });
        y += 46;
    }
    const totalY = Math.max(y + 8, 542);
    document.strokeColor(BRAND.border).moveTo(72, totalY).lineTo(523, totalY).stroke();
    document.fillColor(BRAND.text).font("Helvetica-Bold").fontSize(13).text("Total paid", 72, totalY + 18);
    document.fontSize(14).text(money(order.amount, order.currency), 392, totalY + 17, { width: 131, align: "right" });
    document.roundedRect(72, totalY + 66, 451, 71, 12).fill("#f1f8ff");
    document.fillColor("#42627d").font("Helvetica").fontSize(9.5).text("Keep this invoice for your records. Need help with your order?", 90, totalY + 84);
    document.fillColor(BRAND.blue).font("Helvetica-Bold").text("support@bloxhop.site", 90, totalY + 102);
    document.fillColor("#8b99aa").font("Helvetica").fontSize(8.5).text("Bloxhop Online Store · Secure digital delivery", 72, 750, { width: 451, align: "center" });
    document.end();
    return completed;
}
