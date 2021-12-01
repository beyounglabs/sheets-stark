export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('React Menu') // edit me!
    .addItem('Modal', 'openDialog');

  menu.addToUi();
};
