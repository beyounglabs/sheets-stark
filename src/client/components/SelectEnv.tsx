import React, { useState } from 'react';
import server from 'src/client/utils/server';
import { Loader } from './Loader';

import './select-env.css';

export function SelectEnv({ onDone = () => {} }: { onDone?: () => void }) {
  const [loading, setLoading] = useState<boolean>(false);

  async function save(e: any) {
    e.preventDefault();
    setLoading(true);

    const data = new FormData(e.target);

    server.serverFunctions
      .updateEnv(data.get('env'))
      .then(() => {
        setLoading(false);
        onDone();
      })
      .catch(alert);
  }

  return (
    <form onSubmit={save} className="select-env">
      <div className="block form-group">
        <label htmlFor="envField">
          <b>Ambiente</b>
        </label>

        <select id="envField" name="env" className="fluid">
          <option value="Staging">Staging</option>
          <option value="Produção">Produção</option>
        </select>
      </div>

      <div className="block">
        <button type="submit" className="action fluid">
          Confirmar
        </button>
      </div>

      <Loader loading={loading} />
    </form>
  );
}
