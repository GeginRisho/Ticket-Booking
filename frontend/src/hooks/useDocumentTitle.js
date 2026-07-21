import { useEffect } from 'react';

/**
 * Custom hook to dynamically set document title and meta description for SEO.
 * @param {string} title - The page title
 * @param {string} [description] - Optional meta description
 */
export const useDocumentTitle = (title, description) => {
  useEffect(() => {
    const defaultTitle = 'TicketShow | Book Movie & Event Tickets Online';
    document.title = title ? `${title} | TicketShow` : defaultTitle;

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = description;
        document.head.appendChild(metaDescription);
      }
    }

    // Scroll to top smoothly on page transition
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [title, description]);
};

export default useDocumentTitle;
