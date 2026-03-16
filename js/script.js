document.addEventListener('DOMContentLoaded', () => {

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Reveal Animations on Scroll
  const revealElements = document.querySelectorAll('.reveal');
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // observer.unobserve(entry.target); // keep commenting if we want repeated animation or leave uncommented to animate once
      }
    });
  };

  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
  
  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // Form submission handler
  const form = document.getElementById('enquiry-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      const btn = form.querySelector('.submit-btn');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      // Google Form POST URL
      const googleFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLSdc2jT_00W4fE5BvT8mEQB5nK5K5S8tYfXXV9wWwvA5M6_wHg/formResponse';
      
      // Map names to Google Form entry IDs
      const googleFormData = new URLSearchParams();
      googleFormData.append('entry.2030973045', data.name || '');
      googleFormData.append('entry.2028270804', data.company || '');
      googleFormData.append('entry.1225539894', data.phone || '');
      googleFormData.append('entry.1783451748', data.email || '');
      googleFormData.append('entry.1276346300', data.product || '');
      googleFormData.append('entry.233445959', data.quantity || '');
      googleFormData.append('entry.513975347', data.message || '');

      fetch(googleFormURL, {
        method: 'POST',
        mode: 'no-cors',
        body: googleFormData
      })
      .then(() => {
        alert('Thank you. Your enquiry has been received.');
        form.reset();
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        alert('There was an error submitting your enquiry. Please check your connection and try again.');
      })
      .finally(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  }

  // Infinite Marquee Cloner
  const marqueeContent = document.querySelector('.marquee-content');
  if (marqueeContent) {
    // Clone all spans and append them for a seamless infinite loop
    const children = Array.from(marqueeContent.children);
    children.forEach(child => {
      const clone = child.cloneNode(true);
      marqueeContent.appendChild(clone);
    });
    // Double the clones to ensure it never runs out of horizontal space on ultrawide monitors
    children.forEach(child => {
      const clone = child.cloneNode(true);
      marqueeContent.appendChild(clone);
    });
  }

  // Mobile Menu Toggle
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

});
