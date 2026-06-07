<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SitemapParser
{
    public function parse(string $sitemapUrl): array
    {
        $response = Http::withOptions(['verify' => false])
            ->timeout(30)
            ->get($sitemapUrl);

        if (!$response->successful()) {
            throw new \Exception("Failed to fetch sitemap: HTTP {$response->status()}");
        }

        $body = $response->body();

        $urls = $this->extractUrls($body);

        if (empty($urls)) {
            throw new \Exception('No URLs found in sitemap.');
        }

        return $urls;
    }

    protected function extractUrls(string $xml): array
    {
        $urls = [];

        libxml_use_internal_errors(true);
        $doc = simplexml_load_string($xml);

        if ($doc === false) {
            $doc = simplexml_load_string($this->repairXml($xml));
        }

        if ($doc === false) {
            preg_match_all('/<loc>(.*?)<\/loc>/i', $xml, $matches);
            return $matches[1] ?? [];
        }

        $namespaces = $doc->getNamespaces(true);

        if (isset($doc->sitemap) || isset($doc->sitemapindex)) {
            $sitemapNodes = $doc->sitemap ?? $doc->sitemapindex->sitemap ?? [];
            foreach ($sitemapNodes as $sitemap) {
                $loc = (string)$sitemap->loc;
                if ($loc) {
                    try {
                        $childUrls = $this->parse($loc);
                        $urls = array_merge($urls, $childUrls);
                    } catch (\Exception $e) {
                        continue;
                    }
                }
            }
        } else {
            foreach ($doc->url as $entry) {
                $loc = (string)$entry->loc;
                if ($loc) {
                    $urls[] = $loc;
                }
            }
        }

        return $urls;
    }

    protected function repairXml(string $xml): string
    {
        $xml = preg_replace('/[^\x09\x0A\x0D\x20-\x{D7FF}\x{E000}-\x{FFFD}\x{10000}-\x{10FFFF}]/u', '', $xml);
        return $xml;
    }
}
