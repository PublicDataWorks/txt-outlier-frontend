import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Element.prototype.scrollIntoView = () => {}
