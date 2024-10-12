import { useEffect, useState } from 'react';
import { Store } from 'laco';
import { useStore } from 'laco-react';
import Head from 'flareact/head';

import { getKVMonitors, useKeyPress } from '../src/functions/helpers';
import config from '../config.yaml';
import MonitorCard from '../src/components/monitorCard';
import MonitorFilter from '../src/components/monitorFilter';
import MonitorStatusHeader from '../src/components/monitorStatusHeader';
import ThemeSwitcher from '../src/components/themeSwitcher';

const MonitorStore = new Store({
  monitors: config.monitors,
  visible: config.monitors,
  activeFilter: false,
});

const filterByTerm = (term) =>
  MonitorStore.set((state) => ({
    visible: state.monitors.filter((monitor) =>
      monitor.name.toLowerCase().includes(term),
    ),
  }));

export async function getEdgeProps() {
  // get KV data
  const kvMonitors = await getKVMonitors();

  return {
    props: {
      config,
      kvMonitors: kvMonitors ? kvMonitors.monitors : {},
      kvMonitorsLastUpdate: kvMonitors ? kvMonitors.lastUpdate : {},
    },
    revalidate: 5, // 每 5 秒重新驗證
  };
}

export default function Index({ config, kvMonitors, kvMonitorsLastUpdate }) {
  const state = useStore(MonitorStore);
  const slash = useKeyPress('/');
  const [latestMonitors, setLatestMonitors] = useState(kvMonitors);
  const [lastUpdate, setLastUpdate] = useState(kvMonitorsLastUpdate);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const kvData = await getKVMonitors();

        if (JSON.stringify(kvData.monitors) !== JSON.stringify(latestMonitors)) {
          setLatestMonitors(kvData.monitors);
          setLastUpdate(kvData.lastUpdate);
          MonitorStore.set(() => ({
            monitors: config.monitors,
            visible: config.monitors,
          }));
        }
      } catch (error) {
        console.error('Error fetching monitor data:', error);
      }
    }, 60000); // 每 60 秒檢查一次

    return () => clearInterval(interval); // 清除定時器
  }, [latestMonitors]);

  return (
    <div className="min-h-screen">
      <Head>
        <title>{config.settings.title}</title>
        <link rel="stylesheet" href="./style.css" />
        <script>
          {`
          function setTheme(theme) {
            document.documentElement.classList.remove("dark", "light");
            document.documentElement.classList.add(theme);
            localStorage.theme = theme;
          }
          (() => {
            const query = window.matchMedia("(prefers-color-scheme: dark)");
            query.addListener(() => {
              setTheme(query.matches ? "dark" : "light");
            });
            if (["dark", "light"].includes(localStorage.theme)) {
              setTheme(localStorage.theme);
            } else {
              setTheme(query.matches ? "dark" : "light");
            }
          })();
          `}
        </script>
      </Head>
      <div className="container mx-auto px-4">
        <div className="flex flex-row justify-between items-center p-4">
          <div className="flex flex-row items-center">
            <img className="h-8 w-auto" src={config.settings.logo} />
            <h1 className="ml-4 text-3xl">{config.settings.title}</h1>
          </div>
          <div className="flex flex-row items-center">
            {typeof window !== 'undefined' && <ThemeSwitcher />}
            <MonitorFilter active={slash} callback={filterByTerm} />
          </div>
        </div>
        <MonitorStatusHeader kvMonitorsLastUpdate={lastUpdate} />
        {state.visible.map((monitor, key) => {
          return (
            <MonitorCard
              key={key}
              monitor={monitor}
              data={latestMonitors[monitor.id]}
            />
          );
        })}
        <div className="flex flex-row justify-between mt-4 text-sm">
          <div>
            由{' '}
            <a href="https://workers.cloudflare.com/" target="_blank">
              Cloudflare Workers
            </a>
            {' '}&{' '}
            <a href="https://flareact.com/" target="_blank">
              Flareact
            </a>
            {' '}運行
          </div>
          <div>
            <a href="https://github.com/Youzi9601/" target="_blank">
              聯絡我們
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
