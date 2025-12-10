SELECT
    SUB.name,
    revenue.ddate AS date,
    SUB.accepted AS filing_date,
    SUB.cik,
    FIRST(revenue.value) AS Revenue,
    FIRST(revenue.qtrs) AS q1,
    FIRST(assets.value) AS Assets,
    FIRST(assets.qtrs) AS q2,
    FIRST(curr_assets.value) AS CurrentAssets,
    FIRST(curr_assets.qtrs) AS q3,
    FIRST(curr_liab.value) AS CurrentLiabilities,
    FIRST(curr_liab.qtrs) AS q4,
    FIRST(equity.value) AS StockholdersEquity,
    FIRST(equity.qtrs) AS q5,
    FIRST(assets.value) - FIRST(equity.value) AS TotalLiabilities,
    FIRST(assets.qtrs) AS q6,
    FIRST(assets.value) - FIRST(equity.value) - FIRST(curr_liab.value) AS LongTermDebt,
    FIRST(assets.qtrs) AS q7,
    FIRST(curr_assets.value) - FIRST(curr_liab.value) AS NetCurrentAssets,
    FIRST(curr_assets.qtrs) AS q8,
    FIRST(earnings.value) AS NetIncome,
    FIRST(earnings.qtrs) AS q9,
    FIRST(eps.value) AS EarningsPerShare,
    FIRST(eps.qtrs) AS q10,
    FIRST(shares.value ORDER BY
        CASE shares.tag
            WHEN 'WeightedAverageNumberOfDilutedSharesOutstanding' THEN 1
            WHEN 'WeightedAverageNumberOfSharesOutstandingBasic' THEN 2
            WHEN 'CommonStockSharesOutstanding' THEN 3
            WHEN 'CommonStockSharesIssued' THEN 4
            ELSE 5
        END
    ) AS SharesOutstanding,
    FIRST(shares.qtrs ORDER BY
        CASE shares.tag
            WHEN 'WeightedAverageNumberOfDilutedSharesOutstanding' THEN 1
            WHEN 'WeightedAverageNumberOfSharesOutstandingBasic' THEN 2
            WHEN 'CommonStockSharesOutstanding' THEN 3
            WHEN 'CommonStockSharesIssued' THEN 4
            ELSE 5
        END
    ) AS q11,
    FIRST(shares.tag ORDER BY
        CASE shares.tag
            WHEN 'WeightedAverageNumberOfDilutedSharesOutstanding' THEN 1
            WHEN 'WeightedAverageNumberOfSharesOutstandingBasic' THEN 2
            WHEN 'CommonStockSharesOutstanding' THEN 3
            WHEN 'CommonStockSharesIssued' THEN 4
            ELSE 5
        END
    ) AS SharesTag,
    FIRST(equity.value) / FIRST(shares.value ORDER BY
        CASE shares.tag
            WHEN 'WeightedAverageNumberOfDilutedSharesOutstanding' THEN 1
            WHEN 'WeightedAverageNumberOfSharesOutstandingBasic' THEN 2
            WHEN 'CommonStockSharesOutstanding' THEN 3
            WHEN 'CommonStockSharesIssued' THEN 4
            ELSE 5
        END
    ) AS BookValuePerShare,
    FIRST(equity.qtrs) AS q12,
    SQRT(22.5 * FIRST(eps.value) * (FIRST(equity.value) / FIRST(shares.value ORDER BY
            CASE shares.tag
                WHEN 'WeightedAverageNumberOfDilutedSharesOutstanding' THEN 1
                WHEN 'WeightedAverageNumberOfSharesOutstandingBasic' THEN 2
                WHEN 'CommonStockSharesOutstanding' THEN 3
                WHEN 'CommonStockSharesIssued' THEN 4
                ELSE 5
            END
        ))) AS GrahamNumber,
    FIRST(eps.qtrs) AS q13
FROM SUB
JOIN NUM AS revenue
    ON SUB.adsh = revenue.adsh
    AND revenue.tag LIKE 'RevenueFromContractWithCustomer%'
    AND revenue.segments = ''
JOIN NUM AS assets
    ON SUB.adsh = assets.adsh
    AND assets.tag = 'Assets'
    AND assets.segments = ''
    AND assets.ddate = revenue.ddate
JOIN NUM AS curr_assets
    ON SUB.adsh = curr_assets.adsh
    AND curr_assets.tag = 'AssetsCurrent'
    AND curr_assets.segments = ''
    AND curr_assets.ddate = revenue.ddate
JOIN NUM AS curr_liab
    ON SUB.adsh = curr_liab.adsh
    AND curr_liab.tag = 'LiabilitiesCurrent'
    AND curr_liab.segments = ''
    AND curr_liab.ddate = revenue.ddate
JOIN NUM AS equity
    ON SUB.adsh = equity.adsh
    AND equity.tag = 'StockholdersEquity'
    AND equity.segments = ''
    AND equity.ddate = revenue.ddate
    AND equity.value > 0
LEFT JOIN NUM AS earnings
    ON SUB.adsh = earnings.adsh
    AND earnings.tag = 'NetIncomeLoss'
    AND earnings.segments = ''
    AND earnings.ddate = revenue.ddate
JOIN NUM AS eps
    ON SUB.adsh = eps.adsh
    AND eps.tag LIKE 'EarningsPer%'
    AND eps.segments = ''
    AND eps.ddate = revenue.ddate
    AND eps.value > 0
JOIN NUM AS shares
    ON SUB.adsh = shares.adsh
    AND shares.tag LIKE '%SharesOutstanding'
    AND shares.segments = ''
    AND shares.ddate = revenue.ddate
    AND shares.value > 0
WHERE revenue.value IS NOT NULL
    AND assets.value IS NOT NULL
    AND curr_assets.value IS NOT NULL
    AND curr_liab.value IS NOT NULL
    AND SUB.name ILIKE ?
GROUP BY SUB.name, SUB.cik, revenue.ddate, SUB.accepted
ORDER BY SUB.name, revenue.ddate
