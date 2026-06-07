<?php

namespace App\Services;

class PropertyUrlParser
{
    const PATTERNS = [
        'chris-michael' => [
            'hosts' => ['chris-michael.com.cy', 'www.chris-michael.com.cy'],
            'patterns' => [
                '#chris-michael\.com\.cy/property/([a-zA-Z0-9\-]+)#i',
                '#chris-michael\.com\.cy/listing/(\d+)#i',
                '#chris-michael\.com\.cy/details/(\d+)#i',
            ],
        ],
        'spitogatos' => [
            'hosts' => ['spitogatos.com.cy', 'www.spitogatos.com.cy'],
            'patterns' => [
                '#spitogatos\.com\.cy/(\d+)#i',
            ],
        ],
        'bazaraki' => [
            'hosts' => ['bazaraki.com', 'www.bazaraki.com'],
            'patterns' => [
                '#bazaraki\.com/(?:en/)?adv/(\d+)#i',
                '#bazaraki\.com/(?:en/)?item/(\d+)#i',
            ],
        ],
        'kazo' => [
            'hosts' => ['kazo.com.cy', 'www.kazo.com.cy'],
            'patterns' => [
                '#kazo\.com\.cy/properties/[a-zA-Z0-9\-]+-([a-zA-Z0-9]+)$#i',
            ],
        ],
        'foxrealty' => [
            'hosts' => ['foxrealty.com.cy', 'www.foxrealty.com.cy'],
            'patterns' => [
                '#foxrealty\.com\.cy/property/[a-zA-Z0-9\-]+/(\d+)/?#i',
            ],
        ],
        'aristo' => [
            'hosts' => ['aristodevelopers.com', 'www.aristodevelopers.com'],
            'patterns' => [
                '#aristodevelopers\.com/property/([a-zA-Z0-9\-]+)#i',
            ],
        ],
        'zyprus' => [
            'hosts' => ['zyprus.com', 'www.zyprus.com'],
            'patterns' => [
                '#zyprus\.com/property/(\d+)/#i',
            ],
        ],
        'galaxia' => [
            'hosts' => ['galaxiaestates.com', 'www.galaxiaestates.com'],
            'patterns' => [
                '#galaxiaestates\.com/property/(\d+)/#i',
            ],
        ],
        'developerscyprus' => [
            'hosts' => ['developerscyprus.com', 'www.developerscyprus.com'],
            'patterns' => [
                '#developerscyprus\.com/properties/[a-zA-Z0-9\-]+-(\d+)/?#i',
            ],
        ],
        '1stclass-homes' => [
            'hosts' => ['1stclass-homes.com', 'www.1stclass-homes.com'],
            'patterns' => [
                '#1stclass-homes\.com/(?:[a-z]{2}/)?property/[a-zA-Z0-9\-]+/(\d+)#i',
            ],
        ],
    ];

    public function parse(string $url): ?array
    {
        $host = parse_url($url, PHP_URL_HOST);

        foreach (self::PATTERNS as $website => $config) {
            if (!in_array($host, $config['hosts'])) {
                continue;
            }

            foreach ($config['patterns'] as $pattern) {
                if (preg_match($pattern, $url, $matches)) {
                    return [
                        'website' => $website,
                        'external_id' => $matches[1],
                    ];
                }
            }
        }

        return null;
    }
}
