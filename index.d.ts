/// <reference types="google-apps-script" />

import GSheet = GoogleAppsScript.Spreadsheet;

declare const google: {
  script: {
    host: {
      close: () => void;
    };
  };
} = {
  script: {
    host: {
      close: () => {},
    },
  },
};

type Campaign = {
  id: number;
  code: string;
  description: string;
};
