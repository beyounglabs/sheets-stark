import * as ui from './ui';
import * as common from './common';
import * as updatePrices from './pages/update-prices';

global.onOpen = ui.onOpen;

global.updateEnv = common.updateEnv;

global.updatePrices_openDialog = updatePrices.openDialog;
global.updatePrices_getCampaignList = updatePrices.getCampaignList;
global.updatePrices_setCampaign = updatePrices.setCampaign;
global.updatePrices_getProducts = updatePrices.getProducts;
global.updatePrices_setProducts = updatePrices.setProducts;
global.updatePrices_save = updatePrices.save;
global.updatePrices_reset = updatePrices.reset;
