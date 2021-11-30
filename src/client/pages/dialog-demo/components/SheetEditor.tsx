import React, { useState, useEffect } from 'react';
import server from 'src/client/utils/server';

// This is a wrapper for google.script.run that lets us use promises.

const { serverFunctions } = server;

const SheetEditor = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>();

  useEffect(() => {
    (async function load() {
      setLoading(true);
      const name = await serverFunctions.getSheetsData();
      setName(name);
      setLoading(false);
    })();
    // Call a server global function here and handle the response with .then() and .catch()
  }, []);

  return (
    <div>
      {loading ? <h1>Loading...</h1> : <h1>ENV: {name ?? 'NOT_SET'}</h1>}
    </div>
  );
};

export default SheetEditor;
