import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Loader } from 'src/client/components/Loader';
import { Route, Router, useRouter } from 'src/client/components/Router';
import { SelectEnv } from 'src/client/components/SelectEnv';
import { useCache } from 'src/client/components/useCache';
import server from 'src/client/utils/server';

const { serverFunctions } = server;

export default function UpdatePrices() {
  return (
    <Router>
      <Route path="/">
        <EnvPage />
      </Route>

      <Route path="/campaign">
        <CampaignPage />
      </Route>

      <Route path="/products">
        <ProductsPage />
      </Route>
    </Router>
  );
}

function EnvPage() {
  const { navigate } = useRouter();

  return <SelectEnv onDone={() => navigate('/campaign')} />;
}

function CampaignPage() {
  const { back, navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Campaign[]>([]);

  useEffect(() => {
    setLoading(true);
    serverFunctions
      .updatePrices_getCampaignList()
      .then((list: Campaign[]) => {
        setList(list);
        setLoading(false);
      })
      .catch((e) => {
        alert(e);
        setLoading(false);
      });
  }, []);

  function onSelect(e: any) {
    e.preventDefault();

    const data = new FormData(e.target);

    const campaignCode = data.get('campaign');
    const types = data.getAll('type');

    const campaign = list.find((c) => c.code === campaignCode);

    if (campaign == null) {
      alert(`Campanha não encontrada para ID: ${campaignCode}`);
    }

    setLoading(true);
    serverFunctions
      .updatePrices_setCampaign(campaign)
      .then(() => {
        navigate('/products', {
          campaign,
          types,
        });
      })
      .catch((e) => {
        alert(e);
        setLoading(false);
      });
  }

  return (
    <form onSubmit={onSelect}>
      <div className="block form-group">
        <label htmlFor="campaignField">
          <b>Campanha</b>
        </label>

        <select id="campaignField" name="campaign" className="fluid">
          {list.map((campaign) => (
            <option key={campaign.id} value={campaign.code}>
              {campaign.code}
            </option>
          ))}
        </select>
      </div>

      <div className="block">
        <b>Tipos de Produtos</b>

        <div>
          <input
            name="type"
            type="checkbox"
            id="productType"
            value="PRODUCT"
            defaultChecked
          />
          <label htmlFor="productType">Produtos</label>
        </div>
        <div>
          <input name="type" type="checkbox" id="bundleType" value="BUNDLE" />
          <label htmlFor="bundleType">Kits</label>
        </div>
      </div>

      <hr />

      <div className="button-group block">
        <button type="button" onClick={back}>
          Voltar
        </button>
        <button type="submit" className="action">
          Escolher
        </button>
      </div>

      <Loader loading={loading} />
    </form>
  );
}

function useWindowHeight(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    if (ref.current == null) {
      return;
    }

    ref.current.style.height = `${window.innerHeight}px`;
  }, []);
}

function ProductsPage() {
  const { data, back } = useRouter();
  const [state, setState] = useState<FormData>(() => new FormData());
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [getCache] = useCache('@updatePrice/products', products, []);
  const form = useRef<HTMLFormElement | null>(null);

  useWindowHeight(form);

  function onSubmit(e: any) {
    e.preventDefault();

    const data = new FormData(e.target);

    const selectedIds = data.getAll('product').map(Number);

    const selected = products
      // flats parent with children
      .reduce((all, product) => all.concat(product, product.structure), [])
      .filter((product: any) => selectedIds.includes(product.id));

    setLoading(true);

    serverFunctions
      .updatePrices_setProducts(selected)
      .then(() => {
        setLoading(false);
        google.script.host.close();
      })
      .catch((e) => {
        alert(e);
        setLoading(false);
      });
  }

  useEffect(() => {
    setFiltered(
      products.reduce((all, product) => {
        all[product.id] = true;
        return all;
      }, {})
    );
  }, [products]);

  useEffect(() => {
    if (data == null) {
      return;
    }
    const cache = getCache();

    if (cache.length > 0) {
      setProducts(cache);
    }

    setLoading(true);

    serverFunctions
      .updatePrices_getProducts({ campaign: data.campaign, types: data.types })
      .then((products: any[]) => {
        setLoading(false);
        setProducts(products);
      })
      .catch((e) => {
        alert(e);
        setLoading(false);
      });
  }, [getCache]);

  function filter(e: any) {
    setFiltered(
      products
        .filter((product) => {
          const regex = new RegExp(e.target.value, 'i');

          return regex.test(product.sku) || regex.test(product.description);
        })
        .reduce((all, product) => {
          all[product.id] = true;
          return all;
        }, {})
    );
  }

  function onChange(e: any) {
    const data = new FormData(e.target.form);

    setState(data);
  }

  function isOn(key: string, id: number) {
    return state.getAll(key).includes(String(id));
  }

  return (
    <form
      ref={form}
      onSubmit={onSubmit}
      className="products-container"
      onChange={onChange}
    >
      <div className="fixed block form-group">
        <label>
          <b>Filtrar</b>
          <input
            type="search"
            autoComplete="off"
            className="fluid"
            onChange={filter}
          />
        </label>
      </div>

      <div className="products-list">
        {products.map((product: any) => (
          <React.Fragment key={product.key}>
            <ProductRow
              product={product}
              selected={isOn('product', product.id)}
              expanded={isOn('product_expanded', product.id)}
              visible={filtered[product.id]}
            />

            {isOn('product_expanded', product.id) &&
              product.structure.map((child: any) => (
                <ProductRow
                  key={child.id}
                  product={child}
                  child
                  selected={isOn('product', child.id)}
                  visible={filtered[product.id]}
                />
              ))}
          </React.Fragment>
        ))}
      </div>

      <div className="fixed button-group">
        <button type="button" onClick={back}>
          Voltar
        </button>

        <button type="submit" className="action">
          Importar produtos
        </button>
      </div>

      <Loader loading={loading} />
    </form>
  );
}

function noop() {}

function ProductRow({
  product,
  child = false,
  visible = false,
  selected = false,
  expanded = false,
}: {
  product: any;
  child?: boolean;
  visible?: boolean;
  selected?: boolean;
  expanded?: boolean;
}) {
  return (
    <div
      className="product-row"
      key={product.id}
      data-child={child}
      data-visible={visible}
    >
      <div className="product-row-select">
        <input
          type="checkbox"
          name="product"
          value={product.id}
          id={product.id}
          checked={selected}
          onChange={noop}
        />

        <label className="product-row-info" htmlFor={product.id}>
          <span>{product.description}</span>
          <span className="secondary">{product.sku}</span>
        </label>
      </div>

      {product.structure?.length > 1 ? (
        <label className="product-row-expand">
          <span>Expandir</span>
          <input
            type="checkbox"
            name={`product_expanded`}
            value={product.id}
            checked={expanded}
            onChange={noop}
            id={product.id}
          />
        </label>
      ) : null}
    </div>
  );
}
