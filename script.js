// Select the cursor glow element so it can follow the visitor's pointer.
const cursorGlow = document.querySelector(".cursor-glow");
// Listen for pointer movement across the page.
window.addEventListener("pointermove", event => {
  // Update the glow's horizontal position using a CSS custom property.
  document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
  // Update the glow's vertical position using a CSS custom property.
  document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
});

// Add a compact mobile menu without duplicating navigation markup across pages.
const navShell = document.querySelector(".nav-shell");
const navLinks = document.querySelector(".nav-links");
if (navShell && navLinks) {
  const menuToggle = document.createElement("button");
  menuToggle.className = "menu-toggle";
  menuToggle.type = "button";
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.innerHTML = "<span aria-hidden=\"true\">&#9776;</span>";
  navShell.insertBefore(menuToggle, navLinks);

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    menuToggle.querySelector("span").innerHTML = isOpen ? "&times;" : "&#9776;";
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
      menuToggle.querySelector("span").innerHTML = "&#9776;";
    });
  });
}
// Select every element that should animate into view.
const revealElements = document.querySelectorAll(".reveal");
// Create an observer that detects when reveal elements enter the viewport.
const revealObserver = new IntersectionObserver(entries => {
  // Loop through every observed visibility change.
  entries.forEach(entry => {
    // Animate the element when it becomes visible.
    if (entry.isIntersecting) {
      // Add the active class that triggers the CSS transition.
      entry.target.classList.add("is-visible");
      // Stop watching the element after it has appeared once.
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  // Trigger animations slightly before elements fully enter the screen.
  threshold: 0.16
});
// Attach the observer to each reveal element.
revealElements.forEach(element => revealObserver.observe(element));
// Toggle a page class when the visitor scrolls beyond the top hero position.
function updateScrollGlass() {
  // Add the blur class after a small scroll amount and remove it near the top.
  document.body.classList.toggle("is-scrolled", window.scrollY > 24);
}
// Check the scroll state as soon as the script loads.
updateScrollGlass();
// Update the glass blur state every time the visitor scrolls.
window.addEventListener("scroll", updateScrollGlass, { passive: true });
// Select the contact form used to submit leads to the backend.
const contactForm = document.querySelector("#contactForm");
// Select the status element used for success and error messages.
const formStatus = document.querySelector("#formStatus");
const contactEmail = "s.manqobamazibuko@gmail.com";
function openEmailDraft(formData) {
  const subject = encodeURIComponent(`Website enquiry from ${formData.name || "a visitor"}`);
  const body = encodeURIComponent([
    `Name: ${formData.name || ""}`,
    `Email: ${formData.email || ""}`,
    `Company: ${formData.company || ""}`,
    `Service: ${formData.service || ""}`,
    "",
    formData.message || ""
  ].join("\n"));
  window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
}
// Only activate backend form logic on pages that contain the contact form.
if (contactForm && formStatus) {
// Listen for contact form submissions.
contactForm.addEventListener("submit", async event => {
  // Stop the browser from doing a normal page refresh.
  event.preventDefault();
  // Convert the submitted form fields into a plain object.
  const formData = Object.fromEntries(new FormData(contactForm).entries());
  // Show immediate feedback while the backend is processing.
  formStatus.textContent = "Sending your project request...";
  // Find the submit button so we can prevent double submissions.
  const submitButton = contactForm.querySelector("button[type='submit']");
  // Disable the submit button during the request.
  submitButton.disabled = true;
  // Try to send the form details to the backend.
  try {
    // Send the lead to the backend API as JSON.
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    // Parse the backend response body.
    const result = await response.json();
    // Throw an error when the backend says the request failed.
    if (!response.ok || !result.ok) throw new Error(result.message || "Could not send message.");
    // Show the success message returned by the backend.
    formStatus.textContent = result.message;
    // Clear the form so the visitor sees the submission completed.
    contactForm.reset();
  } catch (error) {
    // Keep the public static site useful even when the local API is unavailable.
    openEmailDraft(formData);
    formStatus.textContent = "Opening your email app so you can send the request directly.";
  } finally {
    // Re-enable the submit button after the request completes.
    submitButton.disabled = false;
  }
});
}
