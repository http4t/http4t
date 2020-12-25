import CreateProperties = chrome.tabs.CreateProperties;
import QueryInfo = chrome.tabs.QueryInfo;
import Tab = chrome.tabs.Tab;
import TabChangeInfo = chrome.tabs.TabChangeInfo;
import {HttpRequest} from "@http4t/core/contract";
import {Uri} from "@http4t/core/uri";
import {resolveable} from "./ResolveablePromise";

export function rootUrl(request: HttpRequest): CreateProperties {
    const requestUri = Uri.of(request.uri);
    const uri = Uri.of({
        scheme: requestUri.scheme,
        authority: requestUri.authority,
        path: "/"
    });
    return {
        url: uri.toString(),
        active: false
    };
}

export function sameHost(request: HttpRequest): QueryInfo {
    const requestUri = Uri.of(request.uri);
    const uri = Uri.of({
        scheme: requestUri.scheme,
        authority: requestUri.authority,
        path: "/*"
    });
    return {url: uri.toString()};
}

export async function waitForTabState(tabId: number, predicate: (tab: Tab, changeInfo: TabChangeInfo | undefined) => boolean, timeoutMs: number): Promise<Tab> {
    const matchingTab = resolveable<Tab>();
    const timeout = resolveable<Tab>();
    const timeoutId = setTimeout(() => timeout.reject(new Error("Timed out while waiting for tab to change state")), timeoutMs);
    const listener = function (_tabId: number, changeInfo: TabChangeInfo, tab: Tab) {
        if (tab.id === tabId && predicate(tab, changeInfo))
            matchingTab.resolve(tab);
    };
    chrome.tabs.onUpdated.addListener(listener);
    try {
        const currentState = await new Promise<Tab>(resolve => chrome.tabs.get(tabId, resolve));
        if (predicate(currentState, undefined))
            return currentState;
        return await Promise.race([matchingTab, timeout]);
    } finally {
        clearTimeout(timeoutId);
        chrome.tabs.onUpdated.removeListener(listener);
    }
}

function createTab(properties: CreateProperties) {
    return new Promise<Tab>((resolve, reject) => {
        chrome.tabs.create(properties, async (tab) => {
            if (!tab) {
                reject({message: "Could not create tab", properties});
            } else {
                resolve(tab)
            }
        })
    })
}

export function tabs(query: QueryInfo): Promise<Tab[]> {
    return new Promise(resolve => {
        chrome.tabs.query(query, (tabs) => {
            resolve(tabs || []);
        })
    })
}

export type CreateTabOpts = {
    waitForTabCreationTimeoutMs?: number
}

export async function findOrCreateTab(
    queryInfo: QueryInfo,
    properties: CreateProperties,
    {waitForTabCreationTimeoutMs = 5000}: CreateTabOpts = {}): Promise<Tab> {
    const existingTab = (await tabs(queryInfo))[0];
    if (existingTab) return existingTab;
    const newTab = await createTab(properties);
    if (typeof newTab.id !== 'number')
        throw {message: "Created tab did not have an id", tab: newTab};
    return await waitForTabState(newTab.id, tab => tab.status === "complete", waitForTabCreationTimeoutMs);
}

export const findTabByHost: TabFinder =
    request => {
        return findOrCreateTab(
            sameHost(request),
            rootUrl(request));
    }
export type TabFinder = (request: HttpRequest) => Promise<Tab>;
