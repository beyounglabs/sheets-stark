import React from 'react';

import './loader.css';

export function Loader({ loading = false }: { loading?: boolean }) {
  return <div className="loader" data-loading={loading}></div>;
}
