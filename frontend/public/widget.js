(function() {
  var container = document.getElementById('viralt-widget');
  if (!container) return;
  var slug = container.getAttribute('data-campaign');
  if (!slug) return;
  var baseUrl = container.getAttribute('data-url') || window.location.origin;
  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/widget/' + slug;
  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.id = 'viralt-iframe-' + slug;
  container.appendChild(iframe);
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'viralt-resize' && e.data.slug === slug) {
      iframe.style.height = e.data.height + 'px';
    }
  });
})();
