import React from 'react';

import './Loader.css';

export function Loader({ loading = false }: { loading?: boolean }) {
  return <div className="loader" data-loading={loading}></div>;
}
