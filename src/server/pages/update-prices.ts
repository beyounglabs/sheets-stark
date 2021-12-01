import { SheetTable } from 'utils/sheet-table';
import { getConfig } from '../core/config';
import { proxyFetch } from '../core/proxy-fetch';

const campaign = new SheetTable({
  sheet: 'Atualizar Preços',
  range: 'CAMPAIGN_INFO',
  fields: ['id', 'code', 'description'],
});

const products = new SheetTable({
  sheet: 'Atualizar Preços',
  range: 'PRODUCTS',
  fields: ['id', 'sku', 'description', 'from_price', 'price'],
});

export function openDialog() {
  const html = HtmlService.createHtmlOutputFromFile('update-prices')
    .setWidth(400)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, ' ');
}

export function getCampaignList(): Campaign[] {
  const config = getConfig();

  const { data } = proxyFetch(
    `${config.mystique}/api/stark/mystique/campaign?active=1`,
    {
      method: 'get',
    }
  );

  return data.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
  }));
}

export function setCampaign(selected: Campaign) {
  campaign.clear();
  campaign.insert([
    {
      id: selected.id,
      code: selected.code,
      description: selected.description,
    },
  ]);
  products.clear();
}

export function getProducts({
  campaign,
  types,
}: {
  campaign: Campaign;
  types: ('PRODUCT' | 'BUNDLE')[];
}) {
  const config = getConfig();

  const { products } = proxyFetch(
    `${config.mystique}/api/stark/campaign-product?campaign_id=${campaign.id}`,
    {
      method: 'get',
    }
  );

  const grouped = products
    .sort((a, b) => (a.sku.startsWith('CONFIG') ? -1 : 1))
    .filter((product: any) => {
      if (
        types.includes('PRODUCT') &&
        (product.sku.startsWith('CONFIG') || !product.sku.startsWith('Bun_'))
      ) {
        return true;
      }

      if (types.includes('BUNDLE') && product.sku.startsWith('Bun_')) {
        return true;
      }

      return false;
    })
    .reduce((grouped, product) => {
      if (product.parent_id == null) {
        grouped[product.id] = [product, []];
      } else {
        grouped[product.parent_id][1].push(product);
      }

      return grouped;
    }, {});

  return Object.values(grouped).map(([product, structure]: [any, any[]]) => ({
    id: product.id,
    parent_id: product.parent_id,
    sku: product.sku,
    description: product.description,
    from_price: product.from_price,
    price: product.price,
    structure,
  }));
}

export function setProducts(selected: any[]) {
  products.clear();
  products.insert(
    selected.map((product: any) => ({
      id: product.id,
      sku: product.sku,
      description: product.description,
      from_price: product.from_price,
      price: product.price,
    }))
  );
}

export function save() {
  const config = getConfig();

  const selected = products.values();

  const productsToUpdate = selected.map((product) => ({
    id: product.id,
    fromPrice: product.from_price,
    price: product.price,
  }));

  proxyFetch(`${config.stark}/campaign-product`, {
    method: 'patch',
    payload: JSON.stringify({
      products: productsToUpdate,
    }),
  });

  SpreadsheetApp.getUi().alert(
    `Os ${productsToUpdate.length} produtos foram atualizados!`
  );

  campaign.clear();
  products.clear();
}
