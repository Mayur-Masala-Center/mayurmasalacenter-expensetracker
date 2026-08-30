// Central place for all WhatsApp message text (Marathi) sent from the app.
// Keeping these in one place keeps the tone warm, consistent, and easy to tweak later.
//
// Convention: every "entry" message takes the amount of THIS transaction plus the
// party's CURRENT overall outstanding balance (after this transaction is applied),
// so the customer/vendor always sees the real, up-to-date picture — not just this one line.
//
// Note: Purchase Vendors (material WE buy) intentionally has no WhatsApp messaging —
// that's just our own internal purchase record-keeping, nothing to notify the vendor about.

const BUSINESS_NAME = "मयूर मसाला सेंटर";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function rupee(n: number): string {
  return `₹${Math.round(Math.abs(n)).toLocaleString("en-IN")}`;
}

/* ------------------------------ Lending (उधारी) ------------------------------ */

export function lendingEntryMessage(entry: {
  person_name: string;
  amount: number;
  remaining: number;
  type: "lend" | "settle";
  date: string;
}): string {
  const dateStr = formatDate(entry.date);

  if (entry.type === "lend") {
    const balanceLine =
      entry.remaining > 0
        ? `📌 सध्या तुमच्याकडे एकूण *${rupee(entry.remaining)}* रक्कम बाकी आहे.`
        : `✅ सध्या तुमच्याकडे कोणतीही रक्कम बाकी नाही. धन्यवाद!`;
    return (
      `नमस्कार ${entry.person_name} जी,\n\n` +
      `${BUSINESS_NAME} कडून कळवण्यात येते की दिनांक ${dateStr} रोजी तुम्हाला ${rupee(entry.amount)} रक्कम उधार देण्यात आली आहे.\n\n` +
      `${balanceLine}\n\n` +
      `कृपया सोयीनुसार परतफेड करावी. काही शंका असल्यास याच नंबरवर संपर्क करावा. 🙏\n\n` +
      `${BUSINESS_NAME}`
    );
  }

  // settle — money received back from the person
  const balanceLine =
    entry.remaining > 0
      ? `📌 या पेमेंटनंतर आता तुमच्याकडे *${rupee(entry.remaining)}* रक्कम बाकी शिल्लक आहे.`
      : `✅ या पेमेंटसह तुमचे संपूर्ण खाते चुकते झाले आहे. धन्यवाद!`;
  return (
    `नमस्कार ${entry.person_name} जी,\n\n` +
    `${BUSINESS_NAME} कडून कळवण्यात येते की दिनांक ${dateStr} रोजी तुमच्याकडून ${rupee(entry.amount)} रक्कम प्राप्त झाली आहे.\n\n` +
    `${balanceLine}\n\n` +
    `सहकार्याबद्दल मनःपूर्वक धन्यवाद. 🙏\n\n${BUSINESS_NAME}`
  );
}

export function lendingFollowUpMessage(entry: {
  person_name: string;
  remaining: number;
}): string {
  return (
    `नमस्कार ${entry.person_name} जी,\n\n` +
    `${BUSINESS_NAME} कडून एक सौम्य आठवण करून देत आहोत — सध्या तुमच्याकडे *${rupee(entry.remaining)}* रक्कम बाकी आहे.\n\n` +
    `कृपया लवकरात लवकर पेमेंट करावे ही नम्र विनंती. काही अडचण असल्यास आम्हाला जरूर कळवा, आम्ही समजून घेऊ. 🙏\n\n` +
    `धन्यवाद,\n${BUSINESS_NAME}`
  );
}

/* --------------------------- Sale vendors (ग्राहकाला विक्री) --------------------------- */
// We SOLD goods to this person — they owe US money.

export function saleVendorEntryMessage(entry: {
  vendor_name: string;
  amount: number;
  remaining: number;
  bill_no?: string | null;
  date: string;
}): string {
  const dateStr = formatDate(entry.date);
  const billLine = entry.bill_no ? ` (बिल क्र. ${entry.bill_no})` : "";
  const balanceLine =
    entry.remaining > 0
      ? `📌 सध्या तुमच्याकडे एकूण *${rupee(entry.remaining)}* रक्कम बाकी आहे.`
      : `✅ संपूर्ण रक्कम प्राप्त झाली आहे. धन्यवाद!`;

  return (
    `नमस्कार ${entry.vendor_name} जी,\n\n` +
    `${BUSINESS_NAME} कडून कळवण्यात येते की दिनांक ${dateStr} रोजी${billLine} तुम्हाला ${rupee(entry.amount)} रकमेची विक्री करण्यात आली आहे.\n\n` +
    `${balanceLine}\n\n` +
    `कृपया सोयीनुसार बाकी रक्कम पाठवावी ही विनंती. धन्यवाद 🙏\n\n${BUSINESS_NAME}`
  );
}

export function saleVendorFollowUpMessage(entry: {
  vendor_name: string;
  remaining: number;
}): string {
  return (
    `नमस्कार ${entry.vendor_name} जी,\n\n` +
    `${BUSINESS_NAME} कडून एक सौम्य आठवण — सध्या तुमच्याकडून *${rupee(entry.remaining)}* रक्कम येणे बाकी आहे.\n\n` +
    `कृपया लवकरात लवकर पेमेंट पाठवण्याची व्यवस्था करावी ही नम्र विनंती. 🙏\n\n` +
    `धन्यवाद,\n${BUSINESS_NAME}`
  );
}

export function whatsappLink(number: string, message: string): string {
  const phone = number.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
