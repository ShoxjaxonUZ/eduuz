export const trackPage = (pageName) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
    })
  }
}

export const trackEvent = (action, category, label) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    })
  }
}