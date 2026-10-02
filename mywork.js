// Select the portal intro line.
const portalIntro = document.querySelector("#portalIntro");
// Select the project list container.
const projectList = document.querySelector("#projectList");
// Select the chart grid container.
const chartGrid = document.querySelector("#chartGrid");
// Select the email example container.
const emailExample = document.querySelector("#emailExample");
// Select the admin panel.
const adminPanel = document.querySelector("#adminPanel");
// Select the admin project form.
const adminProjectForm = document.querySelector("#adminProjectForm");
// Select the logout button.
const logoutButton = document.querySelector("#logoutButton");
// Escape dynamic text before placing it into HTML.
function escapeHtml(value) {
  // Replace unsafe characters with safe HTML entities.
  return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
}
// Render a single project card.
function renderProject(project, isAdmin) {
  // Store the project link HTML when a link exists.
  const link = project.progressLink ? `<a class="button ghost" href="${escapeHtml(project.progressLink)}" target="_blank" rel="noopener">View Progress</a>` : `<span class="empty-link">Progress link coming soon</span>`;
  // Infer a simple stage from the saved project status.
  const status = String(project.status || "Request received").toLowerCase();
  // Estimate progress so clients get a dashboard-style view.
  const progress = status.includes("launch") || status.includes("complete") ? 100 : status.includes("test") ? 82 : status.includes("build") || status.includes("development") ? 68 : status.includes("design") ? 42 : status.includes("plan") ? 25 : 12;
  // Name the current stage in clean customer language.
  const stage = progress >= 100 ? "Launched" : progress >= 82 ? "Testing" : progress >= 68 ? "Development" : progress >= 42 ? "Design" : progress >= 25 ? "Planning" : "Brief Received";
  // Keep the next step helpful even when the admin has not entered one yet.
  const nextStep = progress >= 100 ? "Ongoing support and improvements" : progress >= 82 ? "Launch preparation" : progress >= 68 ? "Final testing" : progress >= 42 ? "Development" : progress >= 25 ? "Design approval" : "Project planning";
  // Render a simple project timeline.
  const timeline = ["Brief received", "Planning", "Design", "Development", "Testing", "Launch"].map((item, index) => {
    const activeIndex = progress >= 100 ? 5 : progress >= 82 ? 4 : progress >= 68 ? 3 : progress >= 42 ? 2 : progress >= 25 ? 1 : 0;
    const className = index < activeIndex ? "done" : index === activeIndex ? "current" : "";
    const symbol = index < activeIndex ? "✓" : index === activeIndex ? "→" : "○";
    return `<li class="${className}"><span>${symbol}</span>${item}</li>`;
  }).join("");
  // Return a complete project card.
  return `<article class="project-card portal-project reveal is-visible"><span>${escapeHtml(project.service || "Project")}</span><strong>${escapeHtml(project.companyName || project.name || "Client Project")}</strong><p>${escapeHtml(project.message)}</p><div class="progress-shell"><div class="progress-bar" style="width:${progress}%"></div></div><div class="portal-status-grid"><p><b>Current Stage</b><br>${escapeHtml(stage)}</p><p><b>Next Step</b><br>${escapeHtml(nextStep)}</p></div><p><b>Latest update:</b> ${escapeHtml(project.adminNote || project.status || "Project request received.")}</p><ul class="portal-timeline">${timeline}</ul><p><b>Project ID:</b> ${escapeHtml(project.id)}</p>${link}${isAdmin ? `<button class="button ghost fill-admin" type="button" data-id="${escapeHtml(project.id)}">Edit This Project</button>` : ""}</article>`;
}
// Render the project cards.
function renderProjects(data) {
  // Store whether the logged-in user is admin.
  const isAdmin = data.user.role === "admin";
  // Show the admin panel only to the owner.
  adminPanel.classList.toggle("is-hidden", !isAdmin);
  // Update the page intro.
  portalIntro.textContent = isAdmin ? "Owner view: all client requests are visible." : `Logged in as ${data.user.email}.`;
  // Show a helpful empty state when no matching projects exist.
  if (!data.projects.length) {
    // Render the empty state.
    projectList.innerHTML = `<article class="portal-card reveal is-visible"><h2>No project requests yet.</h2><p>Submit the contact form with this same email address, then your request will appear here.</p><a class="button primary" href="contact.html">Request a Project</a></article>`;
    // Stop after the empty state.
    return;
  }
  // Render all matching projects.
  projectList.innerHTML = data.projects.map(project => renderProject(project, isAdmin)).join("");
  // Attach admin edit shortcuts.
  document.querySelectorAll(".fill-admin").forEach(button => button.addEventListener("click", () => {
    // Fill the admin project id field.
    adminProjectForm.elements.id.value = button.dataset.id;
    // Scroll the admin panel into view.
    adminPanel.scrollIntoView({ behavior: "smooth" });
  }));
}
// Render email marketing charts and example.
function renderEmailMarketing(info) {
  // Render simple chart cards.
  chartGrid.innerHTML = info.metrics.map(item => `<article><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></article>`).join("");
  // Render the example email content.
  emailExample.innerHTML = `<h3>Example Campaign</h3><p><b>Subject:</b> ${escapeHtml(info.example.subject)}</p><p><b>Preheader:</b> ${escapeHtml(info.example.preheader)}</p><p>${escapeHtml(info.example.body)}</p>`;
}
// Load portal data from the backend.
async function loadMyWork() {
  // Try to fetch the logged-in user's work.
  try {
    // Request the user's project data.
    const response = await fetch("/api/mywork");
    // Parse the JSON result.
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("The live demo portal is not connected to a backend yet. Contact Sanele to receive private project updates.");
    }
    // Redirect to login if not authenticated.
    if (!response.ok || !result.ok) throw new Error(result.message || "Please login first.");
    // Render the project cards.
    renderProjects(result);
    // Render the email marketing suggestion panel.
    renderEmailMarketing(result.emailMarketing);
  } catch (error) {
    // Show a login prompt when the user is not signed in.
    projectList.innerHTML = `<article class="portal-card reveal is-visible"><h2>Login required.</h2><p>${escapeHtml(error.message)}</p><a class="button primary" href="login.html">Login or Sign Up</a></article>`;
    // Render fallback email marketing content.
    renderEmailMarketing({ metrics: [{ label: "Open Rate", value: "42%" }, { label: "Click Rate", value: "18%" }, { label: "Leads", value: "31" }], example: { subject: "This month only: launch your new offer", preheader: "A simple campaign that turns attention into replies.", body: "I build welcome emails, promo campaigns, reminders, and monthly reports so your audience keeps hearing from your brand." } });
  }
}
// Listen for admin project updates.
adminProjectForm?.addEventListener("submit", async event => {
  // Stop the normal page refresh.
  event.preventDefault();
  // Select the admin form status.
  const status = document.querySelector("#adminProjectStatus");
  // Show saving feedback.
  status.textContent = "Saving project update...";
  // Convert form fields to an object.
  const data = Object.fromEntries(new FormData(adminProjectForm).entries());
  // Try to save the update.
  try {
    // Send the update to the backend.
    const response = await fetch("/api/admin/project", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    // Parse the backend result.
    const result = await response.json();
    // Throw when the backend rejects the update.
    if (!response.ok || !result.ok) throw new Error(result.message || "Could not update project.");
    // Show success.
    status.textContent = result.message;
    // Reload the visible project cards.
    await loadMyWork();
  } catch (error) {
    // Show the error.
    status.textContent = error.message;
  }
});
// Listen for logout clicks.
logoutButton?.addEventListener("click", async () => {
  // Ask the backend to clear the session.
  await fetch("/api/logout", { method: "POST" });
  // Return to login.
  window.location.href = "login.html";
});
// Load the portal when the page opens.
loadMyWork();
