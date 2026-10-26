/**
 * AlmostHomeWyoming Contact Form Handler
 *
 * Receives form submissions from the contact page, formats the data
 * into a readable email, and sends a notification to the configured
 * destination address via the Cloudflare Email Service send_email binding.
 */

// ---------------------------------------------------------------------------
// Field configuration
// ---------------------------------------------------------------------------
// Each section groups related fields together so the notification email is
// easy to read. The `label` is what shows up in the email; the `key` matches
// the `name` attribute on the corresponding form input.

const SECTIONS = [
  {
    title: "Personal Information",
    fields: [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "dob", label: "Date of Birth" },
      { key: "phone", label: "Phone" },
      { key: "physicalAddress", label: "Physical Address" },
      { key: "mailingAddress", label: "Mailing Address" },
      { key: "emergencyContact", label: "Emergency Contact" },
      { key: "emergencyPhone", label: "Emergency Phone" },
      { key: "gender", label: "Gender" },
      { key: "maritalStatus", label: "Marital Status" },
      { key: "race", label: "Race" },
      { key: "nativeEnrolled", label: "Native Enrolled" },
      { key: "tribalAffiliation", label: "Tribal Affiliation" },
      { key: "veteranStatus", label: "Veteran Status" },
      { key: "militaryBranch", label: "Military Branch" },
      { key: "education", label: "Education" },
      { key: "disabled", label: "Disabled" },
      { key: "healthInsurance", label: "Health Insurance" },
    ],
  },
  {
    title: "Household & Housing",
    fields: [
      { key: "adultsCount", label: "Adults in Household" },
      { key: "childrenCount", label: "Children in Household" },
      { key: "familyType", label: "Family Type" },
      { key: "peopleNeedingHousing", label: "People Needing Housing" },
      { key: "namesAgesNeedingHousing", label: "Names & Ages Needing Housing" },
      { key: "householdStatus", label: "Household Status" },
      { key: "whereSleptLastNight", label: "Where Slept Last Night" },
      { key: "assistanceTypeAndReason", label: "Assistance Type & Reason" },
      { key: "housingBarriers", label: "Housing Barriers" },
    ],
  },
  {
    title: "Employment",
    fields: [
      { key: "currentlyEmployed", label: "Currently Employed" },
      { key: "willingAndAbleToWork", label: "Willing & Able to Work" },
      { key: "selfEmployer", label: "Employer" },
      { key: "selfWage", label: "Wage" },
      { key: "selfHours", label: "Hours" },
      { key: "reasonUnemployed", label: "Reason Unemployed" },
      { key: "jobsInterestedIn", label: "Jobs Interested In" },
    ],
  },
  {
    title: "Income & Expenses",
    fields: [
      { key: "totalIncomeNoFoodStamps", label: "Total Income (excl. Food Stamps)" },
      { key: "totalIncomeWithFoodStamps", label: "Total Income (incl. Food Stamps)" },
      { key: "totalMonthlyExpenses", label: "Total Monthly Expenses" },
    ],
  },
  {
    title: "Agency Assistance",
    fields: [
      { key: "agencyLIEAP", label: "LIEAP" },
      { key: "agencySection8", label: "Section 8" },
      { key: "agencyTANF", label: "TANF" },
      { key: "agencyPOWER", label: "POWER" },
      { key: "agencyWIC", label: "WIC" },
      { key: "agencyFoodStamps", label: "Food Stamps" },
      { key: "agencyJobServices", label: "Job Services" },
      { key: "agencyCounselingServices", label: "Counseling Services" },
      { key: "agencyWSIL", label: "WSIL" },
      { key: "agencyMedicareMedicaid", label: "Medicare/Medicaid" },
      { key: "agencyKidsCareTitle19", label: "Kids Care / Title 19" },
      { key: "agencyHomelessShelter", label: "Homeless Shelter" },
      { key: "agencyVOCRehab", label: "VOC Rehab" },
      { key: "agencyCommodities", label: "Commodities" },
    ],
  },
  {
    title: "Documentation & Consent",
    fields: [
      { key: "idProof", label: "ID Proof Provided" },
      { key: "incomeProof", label: "Income Proof Provided" },
      { key: "consentSignature", label: "Consent Signature" },
      { key: "consentDate", label: "Consent Date" },
    ],
  },
];

// Sender address — update this to match a domain you have onboarded to
// Cloudflare Email Service. See the README for setup instructions.
const FROM_ADDRESS = "notifications@almosthomewyoming.org";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape user-supplied text for safe inclusion in HTML email content. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Normalize a form value: empty/unchecked becomes a readable placeholder. */
function displayValue(value) {
  if (value === undefined || value === null || value === "") {
    return "—";
  }
  // FormData encodes a checked checkbox as "on".
  if (value === "on") {
    return "Yes";
  }
  return value;
}

/** Convert a submitted file into the attachment format Email Service accepts. */
async function fileToAttachment(file) {
  if (!file || typeof file.arrayBuffer !== "function" || !file.name || file.size === 0) {
    return null;
  }

  return {
    filename: file.name,
    content: await file.arrayBuffer(),
    type: file.type || "application/octet-stream",
    disposition: "attachment",
  };
}

/**
 * Build a plain-text version of the submission by walking the section
 * configuration. Each section becomes a header followed by its fields.
 */
function buildPlainText(data) {
  let text = "";
  for (const section of SECTIONS) {
    text += `\n${section.title}\n${"-".repeat(section.title.length)}\n`;
    for (const field of section.fields) {
      text += `${field.label}: ${displayValue(data[field.key])}\n`;
    }
  }
  return text.trim();
}

/**
 * Build an HTML version of the submission. Uses a simple, email-client
 * friendly table layout with inline styles for maximum compatibility.
 */
function buildHtml(data) {
  const sectionsHtml = SECTIONS.map((section) => {
    const rows = section.fields
      .map((field) => {
        const val = displayValue(data[field.key]);
        return `
        <tr>
          <td style="padding:6px 12px 6px 0;color:#555;font-weight:600;vertical-align:top;white-space:nowrap;">${escapeHtml(field.label)}</td>
          <td style="padding:6px 0;vertical-align:top;">${escapeHtml(val)}</td>
        </tr>`;
      })
      .join("");
    return `
      <h2 style="margin:24px 0 8px;font-size:16px;color:#1a1a1a;border-bottom:1px solid #eee;padding-bottom:6px;">${escapeHtml(section.title)}</h2>
      <table style="border-collapse:collapse;font-size:14px;line-height:1.5;">${rows}</table>`;
  }).join("");

  const submitterName = `${data.firstName || ""} ${data.lastName || ""}`.trim() || "A visitor";

  return `<!DOCTYPE html>
<html>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;background:#f4f4f5;margin:0;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e7;">
      <div style="background:#1a6b3c;padding:20px 24px;">
        <h1 style="margin:0;color:#fff;font-size:18px;font-weight:600;">New Client Intake Form Submission</h1>
        <p style="margin:4px 0 0;color:#cde9d4;font-size:13px;">Almost Home Wyoming &middot; ${escapeHtml(submitterName)}</p>
      </div>
      <div style="padding:8px 24px 24px;">
        ${sectionsHtml}
      </div>
      <div style="padding:12px 24px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#999;">
        Submitted at ${escapeHtml(new Date().toISOString())}
      </div>
    </div>
  </body>
</html>`;
}

/** A friendly HTML thank-you page shown in the browser after submission. */
function thankYouPage() {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thank You</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f4f5;margin:0;padding:24px;}
    .card{max-width:480px;margin:40px auto;background:#fff;border-radius:8px;padding:40px;text-align:center;border:1px solid #e5e5e7;}
    h1{color:#1a6b3c;margin:0 0 12px;font-size:22px;}
    p{color:#555;line-height:1.6;margin:0;}
  </style></head>
  <body>
    <div class="card">
      <h1>Thank you!</h1>
      <p>Your submission has been received. We will be in touch with you soon.</p>
    </div>
  </body>
</html>`;
}

// ---------------------------------------------------------------------------
// Worker entry point
// ---------------------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Only the /submit path is handled; everything else returns 404.
    if (url.pathname !== "/submit") {
      return new Response("Not found", { status: 404 });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "POST" },
      });
    }

    // Parse the multipart/form-data body submitted by the HTML form.
    let formData;
    try {
      formData = await request.formData();
    } catch (err) {
      return new Response("Invalid form data", { status: 400 });
    }

    const data = Object.fromEntries(formData);
    const proofFiles = await Promise.all(
      ["idProof", "incomeProof"].map(async (key) => {
        const file = formData.get(key);
        data[key] = file && typeof file.name === "string" ? file.name : "";
        return fileToAttachment(file);
      }),
    );
    const attachments = proofFiles.filter(Boolean);

    // Build the email content.
    const subject = `New Client Intake form submission from ${data.firstName || ""} ${data.lastName || ""}`.trim();
    const text = buildPlainText(data);
    const html = buildHtml(data);

    // Send the notification email via the Email Service binding.
    try {
      await env.EMAIL.send({
        from: FROM_ADDRESS,
        to: "almosthomewyoming@gmail.com",
        bcc: "bluegroneman10@gmail.com",
        subject,
        text,
        html,
        ...(attachments.length > 0 ? { attachments } : {}),
      });
    } catch (err) {
      console.error("Failed to send notification email:", err);
      return new Response("There was a problem submitting your form. Please try again later.", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Return a friendly thank-you page to the submitter.
    return new Response(thankYouPage(), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
};