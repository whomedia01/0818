/**
 * Core Web Vitals & Client-Side Performance Monitor
 * Evaluates real-user performance metrics to detect SEO & UX bottlenecks
 * Standards: Google Core Web Vitals (LCP, CLS, INP, FID, FCP, TTFB)
 */

(function initCoreWebVitalsMonitor() {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000, unit: 'ms', name: 'Largest Contentful Paint' },
    CLS: { good: 0.1, poor: 0.25, unit: '', name: 'Cumulative Layout Shift' },
    INP: { good: 200, poor: 500, unit: 'ms', name: 'Interaction to Next Paint' },
    FID: { good: 100, poor: 300, unit: 'ms', name: 'First Input Delay' },
    FCP: { good: 1800, poor: 3000, unit: 'ms', name: 'First Contentful Paint' },
    TTFB: { good: 800, poor: 1800, unit: 'ms', name: 'Time to First Byte' }
  };

  const metrics = {
    TTFB: { value: null, rating: 'pending', entry: null, diagnostic: '' },
    FCP: { value: null, rating: 'pending', entry: null, diagnostic: '' },
    LCP: { value: null, rating: 'pending', element: null, diagnostic: '' },
    CLS: { value: 0, rating: 'pending', entries: [], diagnostic: '' },
    FID: { value: null, rating: 'pending', entry: null, diagnostic: '' },
    INP: { value: null, rating: 'pending', element: null, diagnostic: '' }
  };

  function getRating(metricName, value) {
    if (value === null || value === undefined) return 'pending';
    const thresh = THRESHOLDS[metricName];
    if (!thresh) return 'unknown';
    if (value <= thresh.good) return 'good';
    if (value <= thresh.poor) return 'needs-improvement';
    return 'poor';
  }

  function getRatingStyles(rating) {
    switch (rating) {
      case 'good':
        return 'background: #059669; color: #ffffff; font-weight: bold; border-radius: 4px; padding: 2px 6px;';
      case 'needs-improvement':
        return 'background: #d97706; color: #ffffff; font-weight: bold; border-radius: 4px; padding: 2px 6px;';
      case 'poor':
        return 'background: #dc2626; color: #ffffff; font-weight: bold; border-radius: 4px; padding: 2px 6px;';
      default:
        return 'background: #6b7280; color: #ffffff; font-weight: bold; border-radius: 4px; padding: 2px 6px;';
    }
  }

  function logMetric(name, value, rating, detail, diagnostic) {
    const thresh = THRESHOLDS[name];
    const unit = thresh ? thresh.unit : '';
    const formattedVal = typeof value === 'number' ? (name === 'CLS' ? value.toFixed(3) : Math.round(value) + unit) : value;
    const ratingLabel = rating.toUpperCase().replace('-', ' ');

    console.log(
      `%c[SEO/Vitals]%c %c${name}%c ${formattedVal} %c ${ratingLabel} %c ${detail || ''}`,
      'background: #1e293b; color: #38bdf8; font-weight: bold; border-radius: 3px 0 0 3px; padding: 2px 5px;',
      '',
      'color: #0f172a; font-weight: 700; font-size: 11px;',
      'font-family: monospace; font-weight: bold; color: #1e293b;',
      getRatingStyles(rating),
      'color: #64748b; font-size: 10px;'
    );

    if (rating === 'poor' || rating === 'needs-improvement') {
      if (diagnostic) {
        console.warn(`  ↳ ⚠️ SEO Bottleneck Tip [${name}]: ${diagnostic}`);
      }
    }
  }

  // 1. TTFB (Time to First Byte)
  function measureTTFB() {
    try {
      const navEntry = performance.getEntriesByType('navigation')[0];
      if (navEntry) {
        const ttfb = navEntry.responseStart - navEntry.requestStart;
        const rating = getRating('TTFB', ttfb);
        let tip = '';
        if (rating !== 'good') {
          tip = 'High server latency detected. Review server cache, reverse proxy routing, and TTFB headers.';
        }
        metrics.TTFB = { value: ttfb, rating, entry: navEntry, diagnostic: tip };
        logMetric('TTFB', ttfb, rating, `(Target: <= ${THRESHOLDS.TTFB.good}ms)`, tip);
      }
    } catch (e) {
      // Ignore fallback
    }
  }

  // 2. FCP (First Contentful Paint)
  function observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime;
            const rating = getRating('FCP', fcp);
            let tip = '';
            if (rating !== 'good') {
              tip = 'Critical rendering path blocked. Preload fonts/critical CSS and eliminate render-blocking scripts.';
            }
            metrics.FCP = { value: fcp, rating, entry, diagnostic: tip };
            logMetric('FCP', fcp, rating, `(Target: <= ${THRESHOLDS.FCP.good}ms)`, tip);
            observer.disconnect();
          }
        }
      });
      observer.observe({ type: 'paint', buffered: true });
    } catch (e) {
      // PerformanceObserver fallback
    }
  }

  // 3. LCP (Largest Contentful Paint)
  let latestLcpEntry = null;
  function observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          latestLcpEntry = entries[entries.length - 1];
          const lcp = latestLcpEntry.startTime;
          const rating = getRating('LCP', lcp);
          const el = latestLcpEntry.element;
          const tagInfo = el ? `<${el.tagName.toLowerCase()}${el.id ? ' #' + el.id : ''}${el.className ? ' .' + el.className.split(' ')[0] : ''}>` : 'Element';
          let tip = '';
          if (rating !== 'good') {
            tip = `LCP element (${tagInfo}) is rendering slowly. Add fetchpriority="high" or optimize images/videos above the fold.`;
          }
          metrics.LCP = { value: lcp, rating, element: el, diagnostic: tip };
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });

      // Finalize LCP report on user interaction or page hidden
      ['click', 'keydown', 'visibilitychange'].forEach((evt) => {
        window.addEventListener(evt, () => {
          if (latestLcpEntry && metrics.LCP.value !== null) {
            observer.disconnect();
            const el = latestLcpEntry.element;
            const tagInfo = el ? `<${el.tagName.toLowerCase()}${el.id ? ' #' + el.id : ''}>` : '';
            logMetric('LCP', metrics.LCP.value, metrics.LCP.rating, `${tagInfo} (Target: <= ${THRESHOLDS.LCP.good}ms)`, metrics.LCP.diagnostic);
            latestLcpEntry = null;
          }
        }, { once: true, capture: true });
      });
    } catch (e) {
      // PerformanceObserver fallback
    }
  }

  // 4. CLS (Cumulative Layout Shift) with Session Windows
  function observeCLS() {
    try {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries = [];

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only count shifts without recent user input
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            // 5000ms max session window, 1000ms gap
            if (
              sessionValue &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000
            ) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              const rating = getRating('CLS', clsValue);
              let tip = '';
              if (rating !== 'good') {
                tip = 'Layout shifts detected. Ensure all images, iframes, and dynamic containers have explicit width/height or aspect-ratio.';
              }
              metrics.CLS = { value: clsValue, rating, entries: sessionEntries, diagnostic: tip };
            }
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });

      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && metrics.CLS.value > 0) {
          logMetric('CLS', metrics.CLS.value, metrics.CLS.rating, `(Target: <= ${THRESHOLDS.CLS.good})`, metrics.CLS.diagnostic);
        }
      });
    } catch (e) {
      // PerformanceObserver fallback
    }
  }

  // 5. FID (First Input Delay) & INP (Interaction to Next Paint)
  function observeInteractions() {
    try {
      // FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime;
          const rating = getRating('FID', fid);
          let tip = '';
          if (rating !== 'good') {
            tip = 'High input delay. Reduce heavy JavaScript execution during page initialization.';
          }
          metrics.FID = { value: fid, rating, entry, diagnostic: tip };
          logMetric('FID', fid, rating, `(Target: <= ${THRESHOLDS.FID.good}ms)`, tip);
          fidObserver.disconnect();
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // INP
      let maxDuration = 0;
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > maxDuration) {
            maxDuration = entry.duration;
            const rating = getRating('INP', maxDuration);
            let tip = '';
            if (rating !== 'good') {
              tip = 'Main thread blocked during user interaction. Break up long tasks and debounce high-frequency events.';
            }
            metrics.INP = { value: maxDuration, rating, element: entry.target, diagnostic: tip };
          }
        }
      });
      inpObserver.observe({ type: 'event', durationThreshold: 16, buffered: true });
    } catch (e) {
      // PerformanceObserver fallback
    }
  }

  // Overall Core Web Vitals Summary Report
  function printVitalsSummary() {
    const summary = [
      { Metric: 'LCP (Largest Contentful Paint)', Value: metrics.LCP.value ? Math.round(metrics.LCP.value) + ' ms' : 'Measuring...', Target: '<= 2500 ms', Status: metrics.LCP.rating.toUpperCase() },
      { Metric: 'CLS (Cumulative Layout Shift)', Value: typeof metrics.CLS.value === 'number' ? metrics.CLS.value.toFixed(3) : '0.000', Target: '<= 0.100', Status: metrics.CLS.rating.toUpperCase() },
      { Metric: 'INP (Interaction to Next Paint)', Value: metrics.INP.value ? Math.round(metrics.INP.value) + ' ms' : 'Awaiting Input', Target: '<= 200 ms', Status: metrics.INP.rating.toUpperCase() },
      { Metric: 'FCP (First Contentful Paint)', Value: metrics.FCP.value ? Math.round(metrics.FCP.value) + ' ms' : 'Measuring...', Target: '<= 1800 ms', Status: metrics.FCP.rating.toUpperCase() },
      { Metric: 'TTFB (Time to First Byte)', Value: metrics.TTFB.value ? Math.round(metrics.TTFB.value) + ' ms' : 'Measuring...', Target: '<= 800 ms', Status: metrics.TTFB.rating.toUpperCase() }
    ];

    console.groupCollapsed('%c[Core Web Vitals] Real-Time SEO & Performance Audit Report', 'background: #0284c7; color: #ffffff; font-weight: bold; padding: 3px 8px; border-radius: 4px;');
    console.table(summary);
    console.log('💡 Tip: Type `window.getWebVitalsReport()` in console anytime for detailed diagnostic data.');
    console.groupEnd();
  }

  // Initialize listeners
  if (document.readyState === 'complete') {
    measureTTFB();
  } else {
    window.addEventListener('load', () => {
      setTimeout(measureTTFB, 0);
      setTimeout(printVitalsSummary, 1200);
    });
  }

  observeFCP();
  observeLCP();
  observeCLS();
  observeInteractions();

  // Expose global audit helpers
  window.__CORE_WEB_VITALS__ = metrics;
  window.getWebVitalsReport = function getWebVitalsReport() {
    printVitalsSummary();
    return {
      metrics,
      thresholds: THRESHOLDS,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
  };
})();
