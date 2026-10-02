// Send JSON to the backend and parse the response.
async function postJson(url, data) {
  // Send the request using fetch.
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  // Parse the JSON response.
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The live demo portal is not connected to a backend yet. Please contact Sanele to get project access.");
  }
  // Throw an error when the request fails.
  if (!response.ok || !result.ok) throw new Error(result.message || "Request failed.");
  // Return the successful result.
  return result;
}
// Collect form values as a plain object.
function getFormData(form) {
  // Convert form entries into an object.
  return Object.fromEntries(new FormData(form).entries());
}
// Handle a successful login or signup.
function openMyWork() {
  // Send the user to the My Work portal.
  window.location.href = "mywork.html";
}
// Select the signup form.
const signupForm = document.querySelector("#signupForm");
// Select the login form.
const loginForm = document.querySelector("#loginForm");
// Select the hidden admin form.
const adminLoginForm = document.querySelector("#adminLoginForm");
// Select the hidden admin reveal button.
const adminReveal = document.querySelector("#adminReveal");
// Listen for signup submissions.
signupForm?.addEventListener("submit", async event => {
  // Stop the normal page refresh.
  event.preventDefault();
  // Select the signup status area.
  const status = document.querySelector("#signupStatus");
  // Show loading feedback.
  status.textContent = "Creating your account...";
  // Try to create the account.
  try {
    // Send signup details to the backend.
    await postJson("/api/signup", getFormData(signupForm));
    // Open the portal after signup.
    openMyWork();
  } catch (error) {
    // Show the error message.
    status.textContent = error.message;
  }
});
// Listen for login submissions.
loginForm?.addEventListener("submit", async event => {
  // Stop the normal page refresh.
  event.preventDefault();
  // Select the login status area.
  const status = document.querySelector("#loginStatus");
  // Show loading feedback.
  status.textContent = "Logging in...";
  // Try to login.
  try {
    // Send login details to the backend.
    await postJson("/api/login", getFormData(loginForm));
    // Open the portal after login.
    openMyWork();
  } catch (error) {
    // Show the error message.
    status.textContent = error.message;
  }
});
// Reveal the admin form when the hidden trigger is clicked.
adminReveal?.addEventListener("click", () => {
  // Show the hidden admin login form.
  adminLoginForm.classList.remove("is-hidden");
});
// Reveal the admin form when the URL includes the private admin hash.
if (window.location.hash === "#sanele-admin") {
  // Show the hidden admin login form.
  adminLoginForm?.classList.remove("is-hidden");
}
// Listen for hidden owner login submissions.
adminLoginForm?.addEventListener("submit", async event => {
  // Stop the normal page refresh.
  event.preventDefault();
  // Select the admin login status area.
  const status = document.querySelector("#adminLoginStatus");
  // Show loading feedback.
  status.textContent = "Opening owner access...";
  // Try to login as owner.
  try {
    // Send owner login details to the backend.
    await postJson("/api/login", getFormData(adminLoginForm));
    // Open the portal after owner login.
    openMyWork();
  } catch (error) {
    // Show the error message.
    status.textContent = error.message;
  }
});
