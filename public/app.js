const registerForm = document.getElementById("registerForm");
const registerResult = document.getElementById("registerResult");
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  registerResult.textContent = "Saving registration...";
  const data = Object.fromEntries(new FormData(registerForm).entries());
  data.consent = registerForm.elements.consent.checked;
  try {
    const response = await fetch("/api/register", {
      method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data)
    });
    const result = await response.json();
    registerResult.textContent = response.ok ? result.message : (result.error || "Registration failed.");
    if (response.ok) registerForm.reset();
  } catch { registerResult.textContent = "Cannot reach the server. Make sure CLASSGUARD is running."; }
});

document.getElementById("notifyForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const out = document.getElementById("notifyResult");
  out.textContent = "Sending notifications...";
  try {
    const response = await fetch("/api/notify", {
      method: "POST",
      headers: {"Content-Type":"application/json","x-admin-key":document.getElementById("adminKey").value},
      body: JSON.stringify({
        location: document.getElementById("targetLocation").value,
        status: document.getElementById("status").value,
        advisory: document.getElementById("advisory").value,
        dateTime: new Date().toLocaleString()
      })
    });
    const result = await response.json();
    out.textContent = response.ok
      ? `Matched students: ${result.matchedStudents}. Emails accepted by provider: ${result.emailSent}. SMS accepted by provider: ${result.smsSent}. ${result.errors.join(" ")}`
      : (result.error || "Could not send.");
  } catch { out.textContent = "Cannot reach the server. Make sure CLASSGUARD is running."; }
});
