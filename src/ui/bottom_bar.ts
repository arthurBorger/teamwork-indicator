 const bar = document.getElementById('bottomBar');
      if (!bar) console.error('bottomBar not found');

      function update() {
        const doc = document.documentElement;
        const atBottom = Math.ceil(doc.scrollTop + window.innerHeight) >= doc.scrollHeight;

        bar?.classList.toggle('opacity-0', !atBottom);
        bar?.classList.toggle('pointer-events-none', !atBottom);
      }

      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update(); // run once on load