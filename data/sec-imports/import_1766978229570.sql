-- SEC Filings pg_dump
-- Generated: 2025-12-29T03:17:07.785Z
-- Filings: 3497, Companies: 1781, Form Types: 104, Extensions: 1

SET statement_timeout = 0;
SET client_encoding = 'UTF8';

-- Truncate tables (filings first due to FK constraints)
TRUNCATE sec_filings CASCADE;
TRUNCATE sec_companies CASCADE;
TRUNCATE sec_form_types CASCADE;
TRUNCATE sec_file_extensions CASCADE;

-- Form Types
COPY sec_form_types (id, code) FROM stdin;
1	424B2
2	FWP
3	6-K
4	13F-HR
5	497
6	4
7	144
8	3
9	8-K
10	497VPU
11	N-VP/A
12	10-Q
13	SCHEDULE 13G/A
14	S-4/A
15	485BXT
16	DFAN14A
17	SC TO-C
18	DEFA14A
19	SCHEDULE 13D/A
20	24F-2NT
21	CERT
22	NPORT-P
23	424B3
24	424B5
25	ABS-15G
26	40-APP
27	424H
28	SCHEDULE 13G
29	D/A
30	10-K
31	S-8
32	DEF 14A
33	N-30B-2
34	N-CSR
35	485BPOS
36	25-NSE/A
37	25-NSE
38	SCHEDULE 13D
39	1-A
40	4/A
41	5
42	S-1
43	S-3
44	SC TO-T
45	F-10POS
46	ABS-EE
47	F-6EF
48	18-K/A
49	40-17G
50	DRS
51	485APOS
52	SF-3
53	13F-NT
54	497J
55	497K
56	8-A12B
57	POS AM
58	S-8 POS
59	10-D
60	497AD
61	PRE 14A
62	S-1/A
63	N-PX
64	POS AMI
65	SC TO-I/A
66	SC 14D9
67	CFPORTAL/A
68	PREM14A
69	PREC14A
70	D
71	1-A POS
72	15-12G
73	F-4/A
74	8-K/A
75	424B4
76	10-Q/A
77	F-1/A
78	424B7
79	ARS
80	6-K/A
81	20-F
82	PX14A6G
83	C/A
84	3/A
85	10-12G
86	S-3ASR
87	RW
88	425
89	13F-HR/A
90	F-3/A
91	PRE 14C
92	C
93	SC TO-I
94	CB
95	POS462C
96	487
97	C-W
98	S-6
99	F-X
100	X-17A-5
101	DEFR14A
102	N-6/A
103	DEFM14A
104	SC 13E3/A
\.

-- File Extensions
COPY sec_file_extensions (id, ext) FROM stdin;
1	txt
\.

-- Companies
COPY sec_companies (cik, name) FROM stdin;
1000275	ROYAL BANK OF CANADA
1001807	PERUSAHAAN PERSEROAN PERSERO PT TELEKOMUNIKASI INDONESIA TBK
1002672	Bell Bank
1004655	VANGUARD WHITEHALL FUNDS
100591	ARGAN INC
1006394	SCHULZE RICHARD M
1006830	CONSUMERS BANCORP INC /OH/
1006837	INNOVATE Corp.
1007286	VARIABLE ANNUITY 1 SERIES ACCOUNT
1013857	PEGASYSTEMS INC
1016021	EDMP, INC.
101829	RTX Corp
1019432	Leviticus Partners LP
1020523	DELAWARE LIFE VARIABLE ACCOUNT G
1020569	IRON MOUNTAIN INC
1021882	VANGUARD SCOTTSDALE FUNDS
1022079	QUEST DIAGNOSTICS INC
1022671	STEEL DYNAMICS INC
1023512	DRDGOLD LTD
1024305	COTY INC.
102729	VALMONT INDUSTRIES INC
1027552	BANCO SANTANDER CHILE
1029625	MULE EDWARD A
1031000	SCHOTTENSTEIN JAY L
1033767	UNITED MICROELECTRONICS CORP
1035267	INTUITIVE SURGICAL INC
1037155	VARIABLE ANNUITY I SER ACC OF GRT WEST LI & ANNU INS CO OF NY
1037763	OPTIMUM INVESTMENT ADVISORS
1038238	SIMS LUKE E
1038773	SMARTFINANCIAL INC.
1039765	ING GROEP NV
1040130	PETMED EXPRESS INC
1040188	VICTORY CAPITAL MANAGEMENT INC
1040470	AEHR TEST SYSTEMS
1041803	PRICESMART INC
1042729	MERCANTILE BANK CORP
1042773	CENTERPOINT ENERGY RESOURCES CORP
1043961	Precipio, Inc.
1045520	CANADIAN IMPERIAL BANK OF COMMERCE /CAN/
10456	BAXTER INTERNATIONAL INC
1045810	NVIDIA CORP
105319	WW INTERNATIONAL, INC.
1056696	MANHATTAN ASSOCIATES INC
1056823	HORIZON KINETICS ASSET MANAGEMENT LLC
1058307	NextPlat Corp
106040	WESTERN DIGITAL CORP
1061983	CYTOKINETICS INC
1064642	SPDR SERIES TRUST
1065280	NETFLIX INC
1066764	Bimergen Energy Corp
1067294	CRACKER BARREL OLD COUNTRY STORE, INC
1067491	Infosys Ltd
1067839	INVESCO QQQ TRUST, SERIES 1
1068851	PROSPERITY BANCSHARES INC
1069157	EAST WEST BANCORP INC
1069899	PHIBRO ANIMAL HEALTH CORP
1070524	GREENE COUNTY BANCORP INC
1070844	SCHWARZMAN STEPHEN A
1076378	CEMEX SAB DE CV
1080576	SILVER OAK SECURITIES, INCORPORATED
1082554	UNITED THERAPEUTICS Corp
1085041	FIRST NATIONAL BANK SIOUX FALLS
1085867	BRAVE ASSET MANAGEMENT INC
1086745	StableX Technologies, Inc.
1087294	CUMBERLAND PHARMACEUTICALS INC
1088731	BOURGEON CAPITAL MANAGEMENT LLC
1089113	HSBC HOLDINGS PLC
109380	ZIONS BANCORPORATION, NATIONAL ASSOCIATION /UT/
1094285	TELEDYNE TECHNOLOGIES INC
1095981	PLUS THERAPEUTICS, INC.
1098972	AGENUS INC
1100663	iSHARES TRUST
1103646	CSS LLC/IL
1104485	NORTHERN OIL & GAS, INC.
1106566	HALL JOHN T
1106578	ROTHBLATT MARTINE A
1107843	QUALYS, INC.
1108524	Salesforce, Inc.
1108893	PENN DAVIS MCFARLAND INC
1109242	HANMI FINANCIAL CORP
1111565	BNY MELLON FUNDS TRUST
1111928	IPG PHOTONICS CORP
1112668	BRUNER JUDY
1114446	UBS AG
1114618	GATEWAY INVESTMENT ADVISERS LLC
1115055	PINNACLE FINANCIAL PARTNERS INC
1116578	PRUDENTIAL PLC
1119639	PETROBRAS - PETROLEO BRASILEIRO SA
1120193	NASDAQ, INC.
1123274	Bank Pictet & Cie (Europe) AG
1123778	JARISLOWSKY, FRASER Ltd
1123799	WIPRO LTD
1123812	PROFFITT & GOODSON INC
1124198	FLUOR CORP
1124462	KAUFFMAN ROBERT I
1126741	GSI TECHNOLOGY INC
1127371	Community West Bancshares
1128251	DUPONT CAPITAL MANAGEMENT CORP
1128928	FLOWERS FOODS INC
1130310	CENTERPOINT ENERGY INC
1130423	IP FIBRE DEVICES LTD
1131343	ALTERITY THERAPEUTICS LTD
1131399	GSK plc
1133421	NORTHROP GRUMMAN CORP /DE/
1133438	Capital One Auto Receivables LLC
1135951	DR REDDYS LABORATORIES LTD
1137789	Seagate Technology Holdings plc
1140019	TALCOTT RESOLUTION LIFE INSURANCE CO SEPARATE ACCOUNT 11
1140625	EQUINOR ASA
1140771	DAVIDSON INVESTMENT ADVISORS
1140859	Cencora, Inc.
1141819	TRUST FOR PROFESSIONAL MANAGERS
1143335	FIELDS RANDALL K
1144879	Applied Digital Corp.
1145713	BOGAN THOMAS F
1156039	Elevance Health, Inc.
1157408	Stride, Inc.
1159508	DEUTSCHE BANK AKTIENGESELLSCHAFT
1159555	MCDANIEL ANN
1160106	Lloyds Banking Group plc
1162387	CAPITAL ONE FUNDING, LLC
1163321	CAPITAL ONE MULTI ASSET EXECUTION TRUST
1163653	NOMURA HOLDINGS INC
1163739	NABORS INDUSTRIES LTD
1164771	NORTHERN DYNASTY MINERALS LTD
1166663	TSAKOS ENERGY NAVIGATION LTD
1172178	LIBERTY STAR URANIUM & METALS CORP.
1174940	ORAGENICS INC
1175980	MERRILL LYNCH LIFE VARIABLE ANNUITY SEPARATE ACCOUNT D
1175981	ML OF NEW YORK VARIABLE ANNUITY SEPARATE ACCOUNT D
1176334	MARTIN MIDSTREAM PARTNERS L.P.
1177394	TD SYNNEX CORP
1178253	SCYNEXIS INC
1185476	CECERE ANDREW
1185533	GABELLI MARIO J
1187903	GOULD JEFFREY
1187904	GOULD MATTHEW J
1190149	THOMPSON G KENNEDY
1190775	ANGEL STEPHEN F
1191508	COLLIS STEVEN H
1195384	SONNENBERG HARVEY L
1196727	BORGES STEVEN D
1196746	MONDELLO MARK T
1197649	HUANG JEN HSUN
1201489	CANNON MICHAEL R
1201792	AMERICAN PUBLIC EDUCATION INC
1201852	BOXLEY ABNEY S III
1203720	Martin Product Sales LLC
1204385	JAFFEE DANIEL S
1204831	LAU JOANNA T
1207097	STAHL MURRAY
1208385	TANENBAUM ALLAN J
1208752	HORNBAKER RENEE J
1209154	EISENMAN ELAINE J
1212545	WESTERN ALLIANCE BANCORPORATION
1215315	SCHULMAN DANIEL H
1215920	DAVIDSON SPENCER
1218683	Mawson Infrastructure Group Inc.
12208	BIO-RAD LABORATORIES, INC.
1222781	CLEMMER RICHARD L
1225676	SENTINEL INTERNATIONAL TRUST
1227523	OPTIMUM FUND TRUST
1227848	SMOLYANSKY LUDMILA
1230524	Leopard Energy, Inc.
1230869	ASA Gold & Precious Metals Ltd
1235793	HILDEBRANDT JOHN D
1238039	MCINERNEY THOMAS
1239956	WIERENGA WENDELL
1241560	BENDHEIM JACK
1246840	EIN MARK
1248110	NUNNELLY JOHN N
1251987	FISHBACK DONALD R
1254781	POSEY BRUCE K
1260221	TransDigm Group INC
1262182	COCCIO CHRISTOPHER L
1263072	SENTINEL HEDGED EQUITY FUND
1263077	SENTINEL UNCORRELATED FUND
1264136	WOORI FINANCIAL GROUP INC.
1265886	HANSEN WILLIAM DEAN
1268406	BURKE JAMES A
1269026	Sintx Technologies, Inc.
1271850	CHOSY JAMES L
1272164	AMERICAN NATIONAL BANK & TRUST
1273087	MILLENNIUM MANAGEMENT LLC
1274494	FIRST SOLAR, INC.
1275187	ANGIODYNAMICS INC
1280233	SMITH RALPH R
1283699	T-Mobile US, Inc.
1284208	NTV ASSET MANAGEMENT LLC
1287032	PROSPECT CAPITAL CORP
1287614	CAVENS DARRELL
1291446	Credit Suisse Commodity Strategy Funds
1293613	Kayne Anderson Energy Infrastructure Fund, Inc.
1294693	Benioff Marc
1295399	Dastoor Michael
1297107	CoastalSouth Bancshares, Inc.
1300306	EMERGING HOLDINGS INC
1301120	Moreadith Randall
1301236	Sotherly Hotels Inc.
1301396	Context Capital Management, LLC
1301787	BlueLinx Holdings Inc.
1309092	Donnini David
1311755	Herndon Daniel R
1313536	SOTHERLY HOTELS LP
1314760	Forbes William P
1315059	Suncoast Equity Management
1316944	Federal Home Loan Bank of San Francisco
1318220	Waste Connections, Inc.
1318605	Tesla, Inc.
1319947	Designer Brands Inc.
1320350	LENSAR, Inc.
1321392	DeVeydt Wayne S
1324279	Coastline Trust Co
1325814	Federal Home Loan Bank of Des Moines
1325878	Federal Home Loan Bank of Topeka
1326205	IGC Pharma, Inc.
1326771	Federal Home Loan Bank of Cincinnati
1326801	Meta Platforms, Inc.
1328792	TECHPRECISION CORP
1329099	Baidu, Inc.
1329842	Federal Home Loan Bank of New York
1330399	Federal Home Loan Bank of Pittsburgh
1331252	Ferree Deborah L
1331451	Federal Home Loan Bank of Chicago
1331463	Federal Home Loan Bank of Boston
1331465	Federal Home Loan Bank of Atlanta
1331754	Federal Home Loan Bank of Indianapolis
1331757	Federal Home Loan Bank of Dallas
1331971	John Hancock Funds II
1332784	Silver Point Capital L.P.
1333986	Equitable Holdings, Inc.
1334388	OBSIDIAN ENERGY LTD.
1334429	BIGLARI CAPITAL CORP.
1334871	Plourd Martin E
1336706	NORTHPOINTE BANCSHARES INC
1339005	FEMASYS INC
1339688	LION COPPER & GOLD CORP.
1341317	Bridgewater Bancshares Inc
1341439	ORACLE CORP
1347242	LIPELLA PHARMACEUTICALS INC.
1347557	Pacific Airport Group
1349123	Adams Mark
1350156	PREAXIA HEALTH CARE PAYMENT SYSTEMS INC.
1350487	WisdomTree Trust
1352010	EPAM Systems, Inc.
1352280	Columbia Funds Series Trust II
1354457	Nasdaq Stock Market LLC
1355444	EMBRAER S.A.
1355848	Kartoon Studios, Inc.
1356576	SUPERNUS PHARMACEUTICALS, INC.
1356826	LEVY ANDREW A
1356849	Wood John B
1357717	Griffin Mark D
1361896	Yorke Justin W
1362468	Allegiant Travel CO
1362495	Blackstone Alternative Credit Advisors LP
1363558	Collard Craig A
1363598	Entrex Carbon Market, Inc.
1364885	Spirit AeroSystems Holdings, Inc.
1369085	NEW PACIFIC METALS CORP
1372612	BOX INC
1375666	Goodman Gerald
1375877	Canadian Solar Inc.
1378544	SCHERBAKOV EUGENE A
1380106	RAPID MICRO BIOSYSTEMS, INC.
1381979	Warman Nanuk
1382617	O'Shea Robert J
1383951	Nomura America Finance, LLC
1387386	MORRIS FINANCIAL CONCEPTS, INC.
1387467	ALPHA & OMEGA SEMICONDUCTOR Ltd
1387818	Barton Investment Management
1389545	NovaBay Pharmaceuticals, Inc.
1391842	Polar Multi-Strategy Fund
1393657	Kreh Susan M
1393818	Blackstone Inc.
1394866	Penobscot Investment Management Company, Inc.
1397187	lululemon athletica inc.
1397795	Byrn, Inc.
1397911	LPL Financial Holdings Inc.
1399318	Burell Scott R
1404071	Blackstone Group Management L.L.C.
1404074	Blackstone Holdings IV GP Management L.L.C.
1404075	Blackstone Holdings IV GP L.P.
1404077	Blackstone Holdings IV L.P.
1404655	HUBSPOT INC
1407583	Bunker Hill Mining Corp.
1409970	LendingClub Corp
1410600	Feld Peter A
1412163	Polar Long/Short Fund
1412408	Phreesia, Inc.
1413329	Philip Morris International Inc.
1413837	First Foundation Inc.
1414767	Netcapital Inc.
1415515	Fluegel Bradley M
1417038	Hanigan Kevin J
1418329	Ninety One UK Ltd
1419275	RYVYL Inc.
1419828	GS Finance Corp.
1420520	Atomera Inc
1421876	GALAPAGOS NV
1422651	Hinrichs Joseph R
1423053	CITADEL ADVISORS LLC
1423221	Quanex Building Products CORP
1426748	Lazard Freres Gestion S.A.S.
1427350	First City Capital Management, Inc.
1428205	Armour Residential REIT, Inc.
1429764	Blink Charging Co.
1431768	ROBINS BRIAN G
1432353	Global X Funds
1434265	GENMAB A/S
1434316	FATE THERAPEUTICS INC
1434614	SANDSTORM GOLD LTD
1436252	Soccio Phillip
1436468	Zhang Dahe
1438093	Willett Robert
1438848	GAM Holding AG
1442236	Quest Resource Holding Corp
1443006	Leighton Lawrence W.
1445930	KB Financial Group Inc.
1446687	SILVER STAR PROPERTIES REIT, INC
1451612	Booth Bruce
1453687	Cartesian Therapeutics, Inc.
1455515	Polar Multi-Strategy Fund (US) LP
1455971	Tompkins Mark N.
1456048	SIGNATUREFD, LLC
1461945	JCP Investment Management, LLC
1461946	JCP Investment Partnership, LP
1461947	JCP Investment Partners, LP
1461948	JCP Investment Holdings, LLC
1462171	Pappas James C
1462488	Geldmacher Jay L
1463814	Mercedes-Benz Retail Receivables LLC
1464423	PennyMac Mortgage Investment Trust
1464591	GeoPark Ltd
1464694	Blackstone Holdings I L.P.
1464695	Blackstone Holdings I/II GP L.L.C.
1467837	Alford Tony L
1467858	General Motors Co
1468091	VEON Ltd.
1469167	BHATT PRAT
1469241	Hollis Richard Dean
1469336	Empery Asset Management, LP
1472033	Citibank,N.A./ADR
1472246	Council of Europe Development Bank
1473334	Nova Lifestyle, Inc.
1475260	CENOVUS ENERGY INC.
1475841	National Bank Holdings Corp
1476034	Metropolitan Bank Holding Corp.
1476963	Scorpius Holdings, Inc.
1477081	Kolibri Global Energy Inc.
1477720	Asana, Inc.
1479026	Goldman Sachs ETF Trust
1479079	Simmons Jeffrey N
1479599	AGF Investments Trust
1482541	CEA Industries Inc.
1484447	Codispoti Edward H
14846	BRT Apartments Corp.
1488039	ATOSSA THERAPEUTICS, INC.
1488168	Hegarty Kieran
1488864	Duarte Ira
1489090	Meissner William R.
1491874	Parker Geoffrey M.
1491998	Ninety One SA (PTY) Ltd
1492422	Apellis Pharmaceuticals, Inc.
1493580	BNY Mellon ETF Trust
1494904	Global Indemnity Group, LLC
1499422	RBB Bancorp
1500375	Home Federal Bancorp, Inc. of Louisiana
1501697	X4 Pharmaceuticals, Inc
1503584	Costamare Inc.
1504678	Loop Industries, Inc.
1506184	IMMUTEP Ltd
1506251	Citius Pharmaceuticals, Inc.
1506293	PINTEREST, INC.
1506427	Sharp Michael J.
1509261	Rezolute, Inc.
1510281	Saba Capital Management, L.P.
1511393	Chang Mike F
1512442	Pearson Mark
1514597	FURY GOLD MINES LTD
1516212	SSGA Active Trust
1518042	NORTHERN LIGHTS FUND TRUST II
1519339	Hoffman Reid
1519469	ANFIELD ENERGY INC.
1520006	Matador Resources Co
1522325	Liang Yifan
1524273	Rascoff Spencer M
1524348	SPEND LIFE WISELY FUNDS INVESTMENT TRUST
1524472	Xylem Inc.
1524513	iShares U.S. ETF Trust
1525201	DoubleLine Opportunistic Credit Fund
1526243	PERPETUA RESOURCES CORP.
1527641	MATHER GROUP, LLC.
1527762	Mercurity Fintech Holding Inc.
1528396	Guidewire Software, Inc.
1529113	XTI Aerospace, Inc.
1531152	BJ's Wholesale Club Holdings, Inc.
1531183	McPherson John R
1531809	CapWealth Advisors, LLC
1533551	Wellesley Asset Management
1533646	Haley Mark
1534708	Beeline Holdings, Inc.
1534995	Tilenius Stephanie
1535602	BANQUE PICTET & CIE SA
1535631	PICTET BANK & TRUST Ltd
1536755	Commonwealth Financial Services, LLC
1537137	STANDARD LITHIUM LTD.
1537319	Community Financial Services Group, LLC
1537805	Mercedes-Benz Trust Leasing LLC
1538822	Pacific Coast Oil Trust
1540305	ETF Series Solutions
1541507	Porsche Auto Funding LLC
1542108	Verity & Verity, LLC
1542826	Harrison Street Private Wealth LLC
1545193	Wilson Andrew
1546865	Ascent Wealth Partners, LLC
1547361	Morgan Stanley Capital I Inc.
1547576	Krane Shares Trust
1548754	Lemmon David J
1548776	Black Laura A.
1550695	Performant Healthcare Inc
1551423	Barclays Bank Delaware
1551778	Malik Fady Ibraham
1551964	Barclays Dryrock Funding LLC
1552111	Barclays Dryrock Issuance Trust
1552275	Sunoco LP
1553788	SPLASH BEVERAGE GROUP, INC.
1553846	RedHill Biopharma Ltd.
1555694	Im Lisa
1559109	ETFis Series Trust I
1559706	Slate Path Capital LP
1560143	WYTEC INTERNATIONAL INC
1560672	Ellington Credit Co
1561330	Saxony Capital Management, LLC
1563577	Galera Therapeutics, Inc.
1564521	Hoffman Allison C
1564708	NEWS CORP
1565687	Intapp, Inc.
1566388	DoubleLine Income Solutions Fund
1568194	FS Credit Opportunities Corp.
1568884	Ness Trevor
1569866	GLOBAL VALUE INVESTMENT CORP.
1569994	Waterstone Financial, Inc.
1571561	Montana Gregory G
1573575	Constellation Investments, Inc.
1573840	O'DONNELL CAROL A
1576359	T-Mobile Global Zwischenholding GmbH
1576360	T-Mobile Global Holding GmbH
1576704	Measured Risk Portfolios, Inc.
1576942	Stitch Fix, Inc.
1578422	GS Mortgage Securities Trust 2013-GC13
1579157	VINCE HOLDING CORP.
1586253	King James Winston
1587981	COMM 2013-CCRE12 Mortgage Trust
1587982	Investment Managers Series Trust II
1589390	North Square Evanston Multi-Alpha Fund
1590073	Arbor Investment Advisors, LLC
1590715	American Resources Corp
1590750	Viridian Therapeutics, Inc.\\DE
1591890	FG Nexus Inc.
1593001	NightFood Holdings, Inc.
1594540	PEAVINE CAPITAL, LLC
1595097	Corbus Pharmaceuticals Holdings, Inc.
1595248	Genprex, Inc.
1595527	American Strategic Investment Co.
1595726	COMM 2014-CCRE15 Mortgage Trust
1596355	Asset Management Advisors, LLC
1596532	Arista Networks, Inc.
1597213	Deutsche Telekom Holding B.V.
1598504	Olson Eric K.
1598550	E&G Advisors, LP
1598599	Innate Pharma SA
1599404	Trustees of Dartmouth College
1599576	Pictet North America Advisors SA
1601046	Keysight Technologies, Inc.
1601607	BFI Co., LLC
1601705	COMM 2014-CCRE16 Mortgage Trust
1603163	Bolles Albert D.
1603527	Halligan Brian
1603923	Weatherford International plc
1604083	COMM 2014-UBS3 Mortgage Trust
1604821	Natera, Inc.
1605808	Duda Kenneth
1609098	Darsana Capital Partners LP
1610853	Solana Co
1611052	PROCORE TECHNOLOGIES, INC.
1611647	Freshpet, Inc.
1613103	Medtronic plc
1615219	Salarius Pharmaceuticals, Inc.
1615905	Nuveen Global High Income Fund
1616026	Tradewinds Capital Management, LLC
1616262	Rocky Mountain Chocolate Factory, Inc.
1616533	Penguin Solutions, Inc.
1616763	Sentinel Fixed Income Fund
1616765	Sentinel Private Investment Proxy Fund
1616905	Fell Donald G.
1617242	Kearny Financial Corp.
1617553	ZIPRECRUITER, INC.
1617959	COMM 2014-UBS5 Mortgage Trust
1620305	COMM 2014-CCRE20 Mortgage Trust
1620737	ORGANIGRAM GLOBAL INC.
1621221	ARTELO BIOSCIENCES, INC.
1621368	COMM 2014-UBS6 Mortgage Trust
1622244	One World Products, Inc.
1622634	Voskuil Steven E
1622765	GS Mortgage Securities Trust 2014-GC26
1624510	FINANCIAL CONSULATE, INC
1625641	CS Disco, Inc.
1627519	Getsinger Peter W
1628112	COMM 2015-LC19 Mortgage Trust
1628226	DeFlorio Jane E.
1628369	Cushman & Wakefield plc
1628427	Davenport J. Mays
1628498	Bergwall Timothy
1629963	Kelley Joseph P
1629996	Alken Asset Management Ltd
1631596	KKR Real Estate Finance Trust Inc.
1632665	Taylor Frigon Capital Management LLC
1632814	COMM 2015-DC1 Mortgage Trust
1633343	Ninety One North America, Inc.
1633897	Mauch Robert P.
1633910	Hedeker Wealth, LLC
1635342	ETF Portfolio Partners, Inc.
1638600	USCA All Terrain Fund
1638826	ServiceTitan, Inc.
1638833	Surgery Partners, Inc.
1639300	Ollie's Bargain Outlet Holdings, Inc.
1639694	GS Mortgage Securities Trust 2015-GC30
1639695	TruNorth Capital Management, LLC
1640052	COMM 2015-CCRE23 Mortgage Trust
1642896	Samsara Inc.
1643219	Embraer Netherlands Finance B.V.
1643303	Nano Dimension Ltd.
1643573	Ready William J
1644071	Angulo Gonzalez David
1644419	Northern Lights Fund Trust IV
1644771	RiverNorth Capital & Income Fund, Inc.
1645384	COMM 2015-PC1 Mortgage Trust
1646736	COMM 2015-CCRE24 Mortgage Trust
1646972	Albertsons Companies, Inc.
1648087	AMERICAN REBEL HOLDINGS INC
1648257	HUTCHMED (China) Ltd
1648403	Virtus ETF Trust II
1648416	Ferrari N.V.
1649363	ABS Long/Short Strategies Fund
1649989	Outlook Therapeutics, Inc.
1650107	COCA-COLA EUROPACIFIC PARTNERS plc
1650558	Oxbow Fund (Offshore) Ltd
1650559	Oxbow Master Fund Ltd
1651311	Merus N.V.
1651790	COMM 2015-CCRE26 Mortgage Trust
1652149	ALLEN SCOTT R.
1652672	GS Mortgage Securities Trust 2015-GC34
1652997	Oxbow Fund (Onshore) Ltd
1653087	Alector, Inc.
1653323	COMM 2015-CCRE27 Mortgage Trust
1653482	Gitlab Inc.
1654330	COMM 2015-LC23 Mortgage Trust
1655210	BEYOND MEAT, INC.
1655589	Franklin Templeton ETF Trust
1656014	Maplelane Domestic Fund, LP
1656109	Reiss Joel
1656313	Berwick Donald M
1657516	CMH Wealth Management LLC
1658484	Seymon Pamela
1659718	Econ Financial Services Corp
1660046	Immuron Ltd
1660694	Grey Ledge Advisors, LLC
1660999	Chia Stanley
1661245	Moss Adams Wealth Advisors LLC
1661600	SATIVUS TECH CORP.
1661998	Q32 Bio Inc.
1662991	Sezzle Inc.
1663239	COMM 2016-CCRE28 Mortgage Trust
1665518	PHYSICIANS FINANCIAL SERVICES, INC.
1665614	NSSC Funding Portal, LLC
1665650	JPMorgan Chase Financial Co. LLC
1665731	Kirkpatrick Lee
1665925	Ariose Capital Management Ltd
1666268	Morgan Stanley Finance LLC
1667919	FIRST TRUST EXCHANGE-TRADED FUND VIII
1668393	Cosmo Energy Holdings Co., Ltd./ADR
1668738	DBJPM 2016-C1 Mortgage Trust
1669626	Thrivent Core Funds
1670946	Shanahan Patrick M
1670982	Schiffman Glenn
1671502	Quoin Pharmaceuticals, Ltd.
1672619	Enliven Therapeutics, Inc.
1673232	BENKOWITZ MICHAEL
1673772	RAPT Therapeutics, Inc.
1673991	Hawryluk P. Kent
1674020	HORIZON FINANCIAL SERVICES, LLC
1674440	AIRWA INC.
1674510	Zafar Ayesha
1675644	FVCBankcorp, Inc.
1676047	NutriBand Inc.
1676163	SS Innovations International, Inc.
1676283	Garcia Gabriela
1676475	Poff Jared A.
1677390	DBJPM 2016-C3 Mortgage Trust
1677396	O'Donnell Andrea
1679327	CD 2016-CD1 Mortgage Trust
1679707	Velasco Francisco
1680378	SenesTech, Inc.
1680788	Wheels, LLC
1682472	BofA Finance LLC
1682852	Moderna, Inc.
1683542	Fund EQ-DGO, a series of Forge Investments LLC
1683695	International Money Express, Inc.
1684185	Haggart Dylan G.
1685054	CD 2016-CD2 Mortgage Trust
1685159	Zaiac Joanne
1685212	COMM 2016-COR1 Mortgage Trust
1687092	Polar Long/Short Fund (US) LP
1687451	ZK International Group Co., Ltd.
1689346	Equarian Fund, LP
1689548	Praxis Precision Medicines, Inc.
1692038	SIMON QUICK ADVISORS, LLC
1692819	Vistra Corp.
1693577	MainStreet Bancshares, Inc.
1694079	Armor Investment Advisors, LLC
1694592	Pettinga Financial Advisors LLC
1695582	RB Capital Management, LLC
1696867	Radnor Capital Management, LLC
1696957	SigFig Wealth Management, LLC
1698750	TFO Wealth Partners, LLC
1699080	Synergy Asset Management, LLC
1699737	Samsara BioCapital, L.P.
1701756	Sadot Group Inc.
1702123	Cardiol Therapeutics Inc.
1702745	CD 2017-CD4 Mortgage Trust
1703807	Kohl Simeon
1704336	Cloonan Michael
1704720	Cannae Holdings, Inc.
1705929	QUATTRO FINANCIAL ADVISORS LLC
1706403	DBJPM 2017-C6 Mortgage Trust
1706431	Vir Biotechnology, Inc.
1707000	Sullivan Timothy Eugene
1707488	Fund FG-DPU, a series of Forge Investments LLC
1707502	Solid Biosciences Inc.
1707712	Fleming Ned N III
1708263	1992 Co-Invest (Offshore) L.P.
1708269	Atlas Venture Fund XI, L.P.
1708599	Serina Therapeutics, Inc.
1709628	CLOUDASTRUCTURE, INC.
1709682	Custom Truck One Source, Inc.
1710175	ANDERSON MARK M.
1710477	CANTOR FITZGERALD INVESTMENT ADVISORS L.P.
1713112	Mokosak Advisory Group, LLC
1713337	Cobb Peter
1714154	COMM 2017-COR2 Mortgage Trust
1714562	GameSquare Holdings, Inc.
1715925	MindWalk Holdings Corp.
1716654	KEATING LESLIE STARR
1718227	Construction Partners, Inc.
1719388	Mach Innovation Fund, LP
1719611	Kernwood Ltd
1719959	CD 2017-CD6 Mortgage Trust
1720158	Sentinel Passive US Equity Fund
1720773	Rosenberg Nick
1721695	Citadel Securities GP LLC
1721984	Eigenmann Philip D
1722556	BestGofer Inc.
1723596	Columbia Financial, Inc.
1724009	PermRock Royalty Trust
1724729	Refined Wealth Management
1725430	INTELLIGENT BIO SOLUTIONS INC.
1725448	Scheland Laura G
1725506	Dubey Sharmistha
1725882	INX Ltd
1725964	Nutrien Ltd.
1726173	Biglari Holdings Inc.
1727342	Hudson Capital Management LLC
1728328	InMed Pharmaceuticals Inc.
1728657	Wagner Wealth Management, LLC
1729214	XORTX Therapeutics Inc.
1729359	Townsend & Associates, Inc
1729522	Rector, Church-Wardens & Vestrymen of Trinity Church in the city of New-York
1729859	Klimowich John
1729897	Kemly Thomas J.
1730900	Rocking Inc.
1732194	Yezhkov Sergey
1732406	Grayscale Litecoin Trust (LTC)
1732409	Grayscale Bitcoin Cash Trust (BCH)
1733547	GEYGAN JEFFREY RICHART
1734722	UiPath, Inc.
1734726	GEYGAN JAMES
1735438	MeiraGTx Holdings plc
1735733	COMM 2018-COR3 Mortgage Trust
1735964	Cliffwater Corporate Lending Fund
1737287	Allogene Therapeutics, Inc.
1737294	Sellyn Laurence G.
1737842	Intiva Token, Inc.
1737892	Mahoney Paul E
1738071	Yong Rong (HK) Asset Management Ltd
1738074	BlackRock Funds IV
1738460	Skonnard Aaron
1738723	West Branch Capital LLC
1739104	Elanco Animal Health Inc
1739258	Smith Fred Julius III
1739441	Blackstone Credit BDC Advisors LLC
1740063	Pflug Koory, LLC
1741079	HOWE DOUGLAS M.
1741720	Jewell Brent C
1742341	HiTek Global Inc.
1742734	Giroux Richard
1744269	Boehly Todd L
1745853	GRIMALDI CLAUDIA
1745916	PennyMac Financial Services, Inc.
1746109	Bank First Corp
1746376	Nichols Weston
1746438	Vishria Bird Financial Group, LLC
1746470	Taylor Paul Richard
1746967	RiverNorth Opportunistic Municipal Income Fund, Inc.
1748425	Gabelli ETFs Trust
1748566	Roper Michael John
1749744	Global Retirement Partners, LLC
1750155	Charlotte's Web Holdings, Inc.
1751783	Rhinebeck Bancorp, Inc.
1752640	Schlesinger Allyson Katz
1754218	International Equity Long-Only Fund LP - Series E
1754816	STATAR CAPITAL PARTNERS, LP
1756131	CJM Realty Fund LLC
1756543	RVW Wealth, LLC
1756594	Inventiva S.A.
1756959	McGuire Investment Group, LLC
1757499	Shuttle Pharmaceuticals Holdings, Inc.
1758045	Hest Corp
1758232	Blackstone Holdings IV GP Management (Delaware) L.P.
1759495	LiquidX, Inc.
1760903	BONK, INC.
1761312	Palomar Holdings, Inc.
1761325	Grayscale Stellar Lumens Trust (XLM)
1761609	Brooks Judson Ryan
1761857	Klompas Neil A
1761911	Nowigence Inc.
1763501	JPMCC Commercial Mortgage Securities Trust 2019-COR4
1765768	Galibier Capital Management Ltd.
1766156	Salomon & Ludwin, LLC
1767617	RESTON WEALTH MANAGEMENT LLC
1768744	Munro Partners
1768928	Frost Investment Services, LLC
1769697	Snow Lake Resources Ltd.
1769759	Monogram Technologies Inc.
1772383	Armstrong Mac
1773812	Helm Robert F
1775111	Fund FG-NTP, a series of Forge Investments LLC
1775130	Fund FG-DST, a series of Forge Investments LLC
1775734	Beneficient
1776111	MBX Biosciences, Inc.
1776353	Farb Daniel Stuart
1776521	Fund FG-ZBZ, a series of Forge Investments, LLC
1776551	Charles Schwab Trust Bank
1776704	Roberts Evan
1776729	Linetsky David
1776732	Indig Chaim
1776863	VanDuyn Amy Beth
1776985	BioNTech SE
1777319	CISO Global, Inc.
1777921	AvePoint, Inc.
1780312	AST SpaceMobile, Inc.
1780525	Newstead Jennifer
1781174	Acrivon Therapeutics, Inc.
1781319	Li Jeffrey K
1782338	SVF Endurance (Cayman) Ltd
1783312	Fisher Rebecca
1783879	Robinhood Markets, Inc.
1783977	Fund FG-DBD, a series of Forge Investments LLC
1784996	Rosenbaum Michael George
1786352	BILL Holdings, Inc.
1786629	Fund FG-LYW, a series of Forge Investments LLC
1786909	Sibanye Stillwater Ltd
1787336	Corumat, Inc.
1788029	210k Capital, LP
1788393	Adawi Kamal
1788399	DoubleLine Yield Opportunities Fund
1789656	Comitale James J
1789972	Cullinan Therapeutics, Inc.
1790340	Immuneering Corp
1790723	Savior LLC
1791555	Hubbell Strickland Wealth Management, LLC
1792171	Fund FG-JEM, a series of Forge Investments LLC
1793691	Relyea Zuckerberg Hanson LLC
1794034	Juniper Investment Company, LLC
1794194	LaCamp James
1794486	Dolan Ryan Thomas
1795091	OS Therapies Inc
1795250	Sphere Entertainment Co.
1797322	Fund FG-GZX, a series of Forge Investments LLC
1799207	AUNA S.A.
1801170	CLOVER HEALTH INVESTMENTS, CORP. /DE
1801732	Nottebohm Olivia
1801792	Chronos Wealth Management, LLC
1801868	SteelPeak Wealth, LLC
1801926	Mayfair Advisory Group, LLC
1802290	SENTINEL PENSION ADVISORS, LLC
1802516	Adventist Health System/ West
1803227	MATTERN CAPITAL MANAGEMENT, LLC
1803407	Ostin Technology Group Co., Ltd.
1803498	Blackstone Private Credit Fund
1803696	Adeia Inc.
1804116	KOM Wealth Management Group, LLC
1804745	Driven Brands Holdings Inc.
1805284	Rocket Companies, Inc.
1805526	DeFi Development Corp.
1805602	Turner Mary
1806484	Fund FG-VNR, a series of Forge Investments, LLC
1806837	Vertex, Inc.
1807136	Blazewicz Kristin
1807887	Laser Photonics Corp
1807896	Zames Mark
1808323	Cichocki Paul
1809122	CureVac N.V.
1810089	First Pacific Financial
1811074	Texas Pacific Land Corp
1811806	Davis Capital Management
1811907	Citadel Investment Advisory, Inc.
1813744	World Scan Project, Inc.
1815953	Brenner Melissa Anne
1816172	Jiuzi Holdings, Inc.
1816708	Owlet, Inc.
1816736	Disc Medicine, Inc.
1816738	Bailey Stephen
1816970	ARMSTRONG ANNIE
1817229	Vor Biopharma Inc.
1819704	Medirom Healthcare Technologies Inc.
1820144	Grindr Inc.
1820302	Bakkt Holdings, Inc.
1822359	DocGo Inc.
1822523	Advanced Flower Capital Inc.
1823099	Rosenstein Justin
1823138	Two Seas Capital LP
1823466	FiscalNote Holdings, Inc.
1823543	von Bayern Anna
1823608	Amalgamated Financial Corp.
1825461	P2 Nexxt Offshore Fund LP
1825462	P2 Nexxt Offshore Master Fund LP
1825538	P2 Nexxt Fund LP
1825539	P2 Nexxt Fund II LP
1825615	Garcia Ivan
1827821	Forge Global Holdings, Inc.
1827899	Crown PropTech Acquisitions
1828536	Energy Vault Holdings, Inc.
1828805	Aeluma, Inc.
1828813	Mawakana Tekedra
1828937	Finance of America Companies Inc.
1830072	iPower Inc.
1830195	D'Amico Andrew
1830214	Ginkgo Bioworks Holdings, Inc.
1831979	Stardust Power Inc.
1832332	Aveanna Healthcare Holdings, Inc.
1834494	MeridianLink, Inc.
18349	SYNOVUS FINANCIAL CORP
1835856	Better Home & Finance Holding Co
1835994	151 Alternative Performance Fund I LLC
1837493	Inspira Technologies OXY B.H.N. Ltd
1837671	Copper Property CTL Pass Through Trust
1838369	Fund FG-CRF, a series of Forge Investments LLC
1838987	SunPower Inc.
1839066	Reynoso Jamie L.
1839341	Core Scientific, Inc./tx
1839347	Sybal Corp
1839545	GraniteShares Advisors LLC
1840084	Brown Miller Wealth Management, LLC
1840563	PMGC Holdings Inc.
1840776	Hagerty, Inc.
1840904	ATAI Life Sciences N.V.
1841088	Miller Mary
1841125	Bolt Projects Holdings, Inc.
1841675	Argo Blockchain Plc
1842572	Altus Wealth Group LLC
1842630	Fund FG-GPR, a series of Forge Investments LLC
1842754	Cliffwater Enhanced Lending Fund
1843294	Wealth Management Partners, LLC
1843581	Fountainhead AM, LLC
1843582	Fountainhead Capital Management, LLC
1843586	Oatly Group AB
1844147	Rye Brook Capital LLC
1844392	Marpai, Inc.
1844964	Verizon Master Trust
1845003	Golden State Equity Partners
1845149	Chain Bridge I
1845661	Aretos Rebecca
1845930	TITAN GLOBAL CAPITAL MANAGEMENT USA LLC
1846177	WOODWARD DIVERSIFIED CAPITAL, LLC
1846654	Mercier Laurent
1847409	High Tide Inc.
1847794	Twin Lakes Capital Management, LLC
1847986	Dragonfly Energy Holdings Corp.
1848758	NEOS ETF Trust
1849444	SOA Wealth Advisors, LLC.
1850270	PROKIDNEY CORP.
1851535	Lannister Mining Corp.
1852338	Pacific Wealth Management
1853138	Kodiak AI, Inc.
1853145	EverCommerce Inc.
1853904	Spignesi Robert G. Jr.
1854368	Digi Power X Inc.
1854640	Centerra Gold Inc.
1854795	INTEGRATED RAIL & RESOURCES ACQUISITION CORP
1854908	Arumugavelu Shankar
1854963	SHF Holdings, Inc.
1855467	MOBIX LABS, INC
1855764	Ramani Hitesh
1855767	Dines Daniel
1856031	Vivid Seats Inc.
1856610	Wheeler Penny Ann
1856906	Remer Eric Richard
1859392	Galaxy Digital Inc.
1859442	SAKAMOTO RYAN T.
1859690	Arqit Quantum Inc.
1859807	Profusa, Inc.
1859918	TECTONIC ADVISORS LLC
1859919	Barings Private Credit Corp
1860257	CAIN, WATTERS & ASSOCIATES, LLC
1860424	Onex Direct Lending BDC Fund
1860514	Roth CH Acquisition Co.
1860805	Algoma Steel Group Inc.
1861699	Hoffman Gregory A
1862935	Currenc Group Inc.
1862965	Applied Capital LLC
1863894	Regency Capital Management Inc.\\DE
1864030	Laughter John E
1864609	Cascade Private Capital Fund
1865363	Wilke Stacy
1865425	Geygan Kathleen
1865596	Jiang Tianyi
1865782	BrightSpring Health Services, Inc.
1867729	WeRide Inc.
1869511	Lu Jing
1869972	Johnson Troy R
1871321	Alpha Tau Medical Ltd.
1871678	MedTex Elucid Coinvest SPV, LLC
1872254	CV Advisors LLC
1872955	Bendza Gary Mark
1873275	Orca Digital Fund, LP
1873454	Ruanyun Edai Technology Inc.
1874097	Cyngn Inc.
1874315	Satellogic Inc.
1874818	Wickramasinghe Mahes
1876431	Prenetics Global Ltd
1876588	ZimVie Inc.
1877939	Castellum, Inc.
1878122	Mercedes-Benz Auto Receivables Trust 2021-1
1879016	Ivanhoe Electric Inc.
1879373	GRAPHJET TECHNOLOGY
1879754	EShallGo Inc.
1880224	Masino Julie D.
1880279	Bakal Riva
1880290	Fey Lawrence
1880368	Dixon Craig A.
1880431	Vocodia Holdings Corp
1882215	Palladius Income Fund, LP
1882879	Goldman Sachs ETF Trust II
1882961	GM Financial Consumer Automobile Receivables Trust 2021-4
1883788	DIH HOLDING US, INC.
1884021	Volatility Shares Trust
1885319	Roberts Wealth Advisors, LLC
1885327	Atlas Venture Opportunity Fund II, L.P.
1885915	Atkisson Erik
1886694	Weiss Aaron
1886813	McElhenny Sheffield Capital Management, LLC
1891435	Pickus Edward
1892500	Clearmind Medicine Inc.
1894292	TNS Splitter II, LLC
1894302	SJS Investment Consulting Inc.
1894525	Apimeds Pharmaceuticals US, Inc.
1894954	Expion360 Inc.
1895101	Eltoukhy Adam
1895678	GoalFusion Wealth Management, LLC
1896310	GM Financial Consumer Automobile Receivables Trust 2022-1
1897087	SuperX AI Technology Ltd
1898496	Getty Images Holdings, Inc.
1898604	Vestand Inc.
1899030	Fifth Third Wealth Advisors LLC
1899671	Campbell Kotzman Kelly
1899753	Pine Haven Investment Counsel, Inc
1900584	Amplius Wealth Advisors, LLC
1900656	Ford Credit Auto Owner Trust 2022-A
1900679	Technology & Telecommunication Acquisition Corp
1901215	Brenmiller Energy Ltd.
1901337	DMKC Advisory Services, LLC
1903508	Public Policy Holding Company, Inc.
1904033	Buttonwood Financial Advisors Inc.
1905374	Liberty 77 Capital L.P.
1906375	Conyers Yolanda Lee
1907094	Moran James P
1907320	Western Pacific Wealth Management, LP
1907666	Eagle Strategies LLC
1907830	Lamson Christopher B
1907898	SC&H Financial Advisors, Inc.
1908623	PayPay Securities Corp
1908705	Global Engine Group Holding Ltd
1909327	Robbins Edward Hutchinson Jr.
1909739	400 Capital Management LLC
1909851	Morton Brown Family Wealth, LLC
1910381	Kellett Wealth Advisors, LLC
1910456	Lynx1 Capital Management LP
1911000	Intelligent Financial Strategies
1911220	Price David R
1911702	BetterWealth, LLC
1912161	Topercer Benjamin James
1912273	Yunqi Capital Ltd
1912920	McKay Francis
1912954	WidFit Inc.
1913577	Semnur Pharmaceuticals, Inc.
1913608	Values First Advisors, Inc.
1913842	apricus wealth, LLC
1915687	Clay Northam Wealth Management, LLC
1916099	Diameter Credit Co
1916232	GM Financial Consumer Automobile Receivables Trust 2022-2
1916366	My Personal CFO, LLC
1916473	Modi Rajeev A.
1917764	McCoy Frederic E.
1918043	Westward Gold Inc.
1918080	Deep Isolation Nuclear, Inc.
1918712	ARES STRATEGIC INCOME FUND
1920453	Fidelity Private Credit Fund
1921260	DeBrock Kimberly Ann
1922641	Enlight Renewable Energy Ltd.
1922963	SEMITAM BONAM LLC
1923891	Nano Nuclear Energy Inc.
1924868	Tidal Trust II
1925281	Level Wins, LLC
1925853	Sterling Investment Counsel, LLC
1926037	Chico Wealth RIA
1927507	Emission Free Generators, Inc.
1927571	DAY JOSEPH EDWARD III
1929783	WORK Medical Technology Group LTD
1930679	KKR FS Income Trust
1931720	Eden Elisabeth A
1931934	Ford Credit Auto Owner Trust 2022-B
1932377	GM Financial Consumer Automobile Receivables Trust 2022-3
1933059	RETIREMENT GUYS FORMULA LLC
1933138	Naso CRE Bridge Loan Fund, L.P
1933352	BAQS, Inc.
1935210	Chae James
1936611	Brenmiller Avraham
1937262	Lu James Fu Bin
1937441	Ambipar Emergency Response
1937669	Resnik Josh
1937737	Moolec Science SA
1937749	Yao Gerald
1937751	Slabaugh Jon
1938197	Priest Brady Patrick
1938649	Partners Group Lending Fund, LLC
1939365	INSPIRE VETERINARY PARTNERS, INC.
1939429	Aman Todd
1939432	Donnell Paul
1939831	PRESILIUM PRIVATE WEALTH, LLC
1940095	Aflatooni Robert
1940674	SMX (Security Matters) Public Ltd Co
1941506	ZJK Industrial Co., Ltd.
1942346	Summit House Credit Opportunities Fund II LP
1942464	Kokes Mark
1942496	Escobar Dana
1942499	Tanji Kevin
1944019	GM Financial Consumer Automobile Receivables Trust 2022-4
1944044	AG CSF2 (Annex) Dislocation Co-Investment 1, L.P.
1944285	Tema ETF Trust
1944397	Edward K. Christian Trust
1944399	Earlyworks Co., Ltd.
1944485	Ford Credit Auto Owner Trust 2022-C
1944885	Apollomics Inc.
1945422	Oak Woods Acquisition Corp
1946313	Maple Leaf Fund Ltd.
1946398	Riemann Fund Ltd.
1946901	El Puerto de Liverpool, S.A.B. de C.V.
1947086	Altmeyer Anne
1948056	KKR Infrastructure Conglomerate LLC
1948357	Stellar Wealth Partners India Fund I, LP
1950022	Taylor Alexandria
1950226	Aurora Fund Ltd. / Bermuda
1950875	Larson Matthew Scott
1950962	Three Bridge Wealth Advisors, LLC
1951089	Critical Metals Corp.
1951118	Mercedes-Benz Auto Receivables Trust 2022-1
1951593	Ninepoint Energy Fund
1951752	Ford Credit Auto Owner Trust 2022-D
1951891	EDUCATION GROWTH PARTNERS II, L.P.
1953331	Palladius Real Estate Fund II, LP
1953926	Zenas BioPharma, Inc.
1954429	O'Connor Casey
1954480	Western Financial Corp/CA
1954661	CastleKnight Master Fund LP
1954694	Lucas GC Ltd
1955705	GVP 2021-A, L.P.
1955706	GVP 2021-A, LLC
1956471	Meredith Wealth Planning
1956649	Daner Wealth Management, LLC
1957124	UNIQUE WEALTH, LLC
1957325	EAG Holdings LP
1957369	Smith Maria
1957424	Mercedes-Benz Auto Receivables Trust 2023-1
1957521	Equitybee 22-80413, a Series of Equitybee cFund Master LLC
1957685	GM Financial Consumer Automobile Receivables Trust 2023-1
1957840	Onyx Financial Advisors, LLC
1957845	KKR Private Equity Conglomerate LLC
1958252	knownwell, inc.
1958491	Hofer & Associates. Inc
1959023	Safe & Green Development Corp
1959548	Hancock Timberland & Farmland Access Fund, LP
1960212	JDM Financial Group LLC
1961629	FIVE 2023-V1 Mortgage Trust
19617	JPMORGAN CHASE & CO
1961850	Kooman & Associates
1962481	BranchOut Food Inc.
1962838	Schear Investment Advisers, LLC
1963001	Equitybee 22-57092, a Series of Equitybee cFund Master LLC
1963807	Goldstein Advisors, LLC
1963967	CPA Asset Management Group, LLC
1964389	PPSC Investment Service Corp
1964738	Solventum Corp
1964741	Neal Robert James
1965119	Melachrino Kristine
1965234	1789 Capital Fund I, LP
1965271	WATERSHED PRIVATE WEALTH LLC
1965756	C2P Capital Advisory Group, LLC d.b.a. Prosperity Capital Advisors
1965814	BOS Asset Management, LLC
1966011	Massachusetts Wealth Management
1966033	True Wealth Design, LLC
1966210	Strait & Sound Wealth Management LLC
1966394	Fortress Net Lease REIT
1966647	Baiju Prafulkumar Bhatt Living Trust
1967111	Ford Credit Auto Owner Trust 2023-A
1967168	Kintz Samuel
1968204	GM Financial Consumer Automobile Receivables Trust 2023-2
1968915	PHINIA INC.
1969180	Coller Secondaries Private Equity Opportunities Fund
1970509	Haymaker Acquisition Corp. 4
1970527	Gandhi Balaji
1970544	Pheton Holdings Ltd
1970701	Delta Wealth Advisors LLC
1970751	Advisor Managed Portfolios
1971222	Fu Howard
1971267	Reynoso Diego
1972492	Srinivasan Priya
1974300	Mercedes-Benz Auto Lease Trust 2023-A
19745	CHESAPEAKE UTILITIES CORP
1974775	Alford Christine
1975499	Wells Drew Allen
1975605	Equitybee 22-25179, a Series of Equitybee cFund Master LLC
1975736	KKR FS Income Trust Select
1976065	Noble Family Wealth, LLC
1976517	Roundhill ETF Trust
1976672	Grayscale Funds Trust
1976990	Ramchandani Rohit
1977206	Ladwa Akshay
1977224	Ford Credit Auto Owner Trust 2023-B
1977441	Coen Steven P.
1978199	Caple Frederick William
1979069	GM Financial Consumer Automobile Receivables Trust 2023-3
1979207	UrgentIQ Inc.
1979396	Planck Holdings LLC - Series 6714
1979416	Planck Holdings LLC - Series 6989
1979477	Sprott Physical Commodities Fund, LP
1981535	SharpLink Gaming, Inc.
1981748	Gai Na
1981781	Li Wei
1982245	Zhang Jun
1982701	AB Private Lending Fund
1984060	Atlas Energy Solutions Inc.
1984180	Eldred Rock Partners, LLC
1984529	Davis Laura
1985273	TOYO Co., Ltd
1986196	Clio Asset Management LLC
1987248	Sadin Wayne J
1987592	Fleming Ned N. IV
1990080	INVESCO, LLC
1990354	Waystar Holding Corp.
1991085	Ford Credit Auto Lease Trust 2023-B
1991088	GM Financial Consumer Automobile Receivables Trust 2023-4
1992816	Fireroad Holdings, Inc.
1992972	MN Wealth Advisors, LLC
1993004	NorthWestern Energy Group, Inc.
1993147	EVRAN SEDAT
1993977	Mercedes-Benz Auto Receivables Trust 2023-2
1994899	Equitybee 22-12374, a Series of Equitybee cFund Master LLC
1995568	Voya Enhanced Securitized Income Fund
1995773	GSG Advisors LLC
1996052	Driven Fund I, LP
1996154	UNICOM Systems, Inc.
1996239	Fund FG-XYE, a series of Forge Investments LLC
1996605	SIX FOUR HOSPITALITY FUND I, LLC
1996846	Financiere des Professionnels - Fonds d'investissement inc.
1997809	Brooks Gabriel
1997845	Sentinel Private Equity XVII Fund
1998250	Sinclair III Eric L. (Ric)
1998559	Ford Credit Auto Owner Trust 2023-C
1998738	GreenMan Vision, Inc.
1998822	Mercedes-Benz Auto Receivables Trust 2024-1
1999127	AutoSquared LLC
1999262	Triple Impact Capital Fund II, L.P.
1999826	Heine Ramona
1999883	Main Street Investment Fund LLC
2000775	Black Hawk Acquisition Corp
2001520	PUREfi Wealth, LLC
2001527	n3xt inc
2001544	Stephenson & Company, Inc.
2001616	ISFS AG
2002236	SPRINGVIEW HOLDINGS LTD
200245	Citigroup Global Markets Holdings Inc.
2003007	GM Financial Consumer Automobile Receivables Trust 2024-1
2003061	Star Fashion Culture Holdings Ltd
2004982	Benchmark 2024-V5 Mortgage Trust
2005257	Kovaleski Paul
2005575	Robey Walter Wade
200648	ROMANO BROTHERS AND COMPANY
2006815	Voyager Acquisition Corp./Cayman Islands
2006933	Ford Credit Auto Lease Trust 2024-A
2007274	Rice Shawn G
2008608	Equitybee 22-95109, a Series of Equitybee cFund Master LLC
2009273	Crown Oak Advisors, LLC
2010507	Discipline Wealth Solutions, LLC
2010959	AMBITIONS ENTERPRISE MANAGEMENT CO. L.L.C
2011000	Foundation Wealth Management, LLC\\PA
2011053	POWERBANK Corp
2011201	Elm3 Financial Group, LLC
2011208	Safe Pro Group Inc.
2011427	Fogel Capital Management, Inc.
2011580	Ballentine Capital Advisors, Inc
2011807	Schick Gary K.
2011895	Cooke Malcolm G.
2012047	Hill Donna K.
2012578	Dawson Patrick James
2012600	rYojbaba Co., Ltd.
2013090	European Lithium Ltd.
2013919	GM Financial Consumer Automobile Receivables Trust 2024-2
2014176	Ford Credit Auto Owner Trust 2024-A
2014337	Texxon Holding Ltd
2014640	Agrawal Shantanu
2014677	LIERMAN TERRY L
2016056	IGNITEDATA (DELAWARE) INC.
2016072	M3-Brigade Acquisition V Corp.
2016960	Jones Laura Rachel
2016973	Mercedes-Benz Auto Lease Trust 2024-A
2016991	HDFC India Flexi Cap Fund
2018222	707 Cayman Holdings Ltd.
2018244	HighVista Venture Capital XIV (Offshore), LP
2018847	HighVista Venture Capital XIV, LP
2019435	Blue Gold Ltd
2019793	XCF Global, Inc.
2021208	Cascade Financial Partners, LLC
2021997	Harbright 2024 SonoVascular Series, a series of Harbright LLC
2023493	William Howard & Co Financial Advisors Inc
2023554	Sandisk Corp
2023568	Global Financial Private Client, LLC
2023756	Ford Credit Auto Owner Trust 2024-B
2024049	Investment Planning Advisors, Inc.
2024378	Hebard Gregory B
2024984	Ni Ping
2025015	Priestley Andrew
2025072	Crowley Matthew
2026150	M Wealth Management, LLC
2026197	GM Financial Consumer Automobile Receivables Trust 2024-3
2026391	OMC Financial Services LTD
2026738	FORTRESS CREDIT REALTY INCOME TRUST
2026767	Calisa Acquisition Corp
2027613	TALL PINES CAPITAL, LLC
2027960	Bernal Maya
2028336	New ERA Energy & Digital, Inc.
2028621	ACCREDITED INVESTOR SERVICES, LLC
2028707	INFLECTION POINT ACQUISITION CORP. IV
2029654	Ford Credit Auto Lease Trust 2024-B
2030522	Marwynn Holdings, Inc.
2030635	Berry Adam E.
2030763	Wellgistics Health, Inc.
2031235	Farrell Financial LLC
2031283	Stone Point Credit Income Fund
2031750	Ares Core Infrastructure Fund
2031960	Atkinson John W.
2032432	Blackstone Private Multi-Asset Credit & Income Fund
2032544	Christensen, King & Associates Investment Services, Inc.
2032687	LEGACY OPPORTUNITY FUND LLC/TX
2033071	Rebundle, Inc
2033250	Mercedes-Benz Auto Lease Trust 2024-B
2033312	Summit Wealth Partners, LLC
2033535	Costamare Bulkers Holdings Ltd
2033921	Ford Credit Auto Owner Trust 2024-C
2034160	Windsor Private Capital LP
2034978	Specialty Cups, Inc.
2035992	Charming Medical Ltd
2036042	Sionna Therapeutics, Inc.
2036069	Equitybee 22-58021, a Series of Equitybee cFund Master LLC
2036135	AUGUREY VENTURES I, LLC - SERIES ANTHROPIC B
2036136	AUGUREY VENTURES II, LLC - SERIES ANTHROPIC B
2036137	AUGUREY VENTURES III, LLC - SERIES ANTHROPIC B
2036142	Jumana Capital Investments LLC
2036648	FT Vest Rising Dividend Achievers Total Return Fund
2036778	Schab Amanda Rosseter
2036780	GM Financial Consumer Automobile Receivables Trust 2024-4
2037436	AUGUREY VENTURES III, LLC - SERIES FIGURE C
2037437	AUGUREY VENTURES II, LLC - SERIES FIGURE C
2037438	AUGUREY VENTURES I, LLC - SERIES FIGURE C
2037949	Hino Motors, Ltd.
2038185	Jabez Biosciences, Inc.
2038510	Stagecoach Fund, LP
2038992	Larx Apex LP
2039243	Edgett Sean
2039300	White & Co Financial Planning Inc
2039570	Mitsubishi Fuso Truck & Bus Corp
2040032	Coatue Offshore Fund II, Ltd.
2040040	HedgePremier/Jain Global Offshore Fund Ltd
2040041	HedgePremier/Jain Global Onshore Fund LP
2040538	Emmerich Meredith
2040820	AUGUREY VENTURES I, LLC - SERIES VOYAGER SPACE A
2040822	AUGUREY VENTURES II, LLC - SERIES VOYAGER SPACE A
2040834	AUGUREY VENTURES III, LLC - SERIES VOYAGER SPACE A
2040995	S2K/Miller CLT Fund, LP
2041234	Fischer Jamie
2041324	HDFC India Mid-Cap Opportunities Fund
2041707	Emission Critical, LP
2041900	Columbia Credit Income Opportunities Fund
2041913	Martin Christopher Ross
2042059	MarketDesk Indices LLC
2042378	Closer to the Origins LLC
2042408	Green Cabbage, Inc.
2042453	Ford Credit Auto Owner Trust 2024-D
2042544	Present Tense LLC
2043198	SOF-XIII FEEDER KA, L.P.
2043954	REX ETF Trust
2044492	Mercedes-Benz Auto Receivables Trust 2025-1
2045642	Sherry David
2046656	Happy City Holdings Ltd
2046751	Generali Asset Management SPA SGR
2046881	Laygo Sheryl
2046919	Rainbow Capital Holdings Ltd
2047316	GM Financial Consumer Automobile Receivables Trust 2025-1
2047442	Calamos Aksia Private Equity & Alternatives Fund
2047697	RRF Fund LLC
2048361	Grand Bright International Holdings Ltd
2048913	Ford Credit Auto Lease Trust 2025-A
2049733	Blackstone Private Real Estate Credit & Income Fund
2049857	PENNEY FINANCIAL, LLC
2050755	Reprogrammed Interchange LLC
2051303	Equitybee 22-97763, a Series of Equitybee cFund Master LLC
2051365	Yong Lin
2051630	Lazard Active ETF Trust
2051665	Dhanji Alim
2051717	LIFELONG WEALTH ADVISORS, INC.
2052205	Mink Brook Asset Management LLC
2053013	Emeth Value Capital, LLC
2055178	Sage Investment Counsel LLC
2055414	Bay Capital Advisors, LLC
2055570	Riverbend Wealth Management, LLC
2055592	Gemini Space Station, Inc.
2055836	CROWLEY WEALTH MANAGEMENT, INC.
2056037	Prepared Retirement Institute LLC
2056063	Redwood Maple Mortgage Fund, LP
2056135	GUGGENHEIM DEFINED PORTFOLIOS, SERIES 2534
2056263	Columbus Circle Capital Corp. I
2056795	Three Magnolias Financial Advisors, LLC
2057088	Tregillis Cynthia L
2057342	Ford Credit Auto Owner Trust 2025-A
2057809	Bailey Steven Richard Jr.
2057896	Blackstone Private Credit Strategies LLC
2058637	Tap Root Capital Fund I LP
2058897	Grupo Cibest S.A.
2060016	Agencia Comercial Spirits Ltd.
2060144	Shek Bernard
2060298	Thoma Capital Management LLC
2060415	First Eagle Completion Fund Trust
2060535	GM Financial Consumer Automobile Receivables Trust 2025-2
2060744	Hosseini Hesam
2061818	Greenbush Financial Group, LLC
2062312	EquityZen Growth Technology Fund LLC - Series 2114
2064001	Fischer Financial Services, Inc.
2064260	BCRED X HOLDINGS LLC
2064489	Kagan Cocozza Asset Management
2064615	Mercedes-Benz Auto Lease Trust 2025-A
2064729	Baugnon Robert G
2065254	INVEXT BARIENDO SEED A SERIES OF INVEXT LLC
2066736	Hollingsworth Tyler Jay
2066812	Brookwood Investment Group LLC
2067339	Wealth Management Associates, Inc.
2068385	Roth CH Holdings, Inc.
2069480	JUSKIE JO ANN
2069695	BridgeInvest Credit Fund V LP
2069728	BI Credit Fund V REIT LLC
2070261	Monkey Tree Investment Ltd
2070429	Mangusta Capital Fund I, L.P.
2071240	GM Financial Consumer Automobile Receivables Trust 2025-3
2071444	RevolverCap Partners Fund III (Cayman), L.P.
2071803	RevolverCap Partners Fund III, L.P.
2071873	Magouyrk Clayton M.
2072421	Seneca Bancorp, Inc.
2073307	Polaris Partners XI, L.P.
2075541	AURASEN INC
2075816	Emmis Acquisition Corp.
2076163	ProCap Financial, Inc.
2076477	MSMBA Fund I, a series of MSMBA Funds, LP
2076786	Diveroli Investment Group LLC
2076830	BoxGroup Leaven, LP
2077002	ASK Absolute Return Fund
2077045	BoxGroup Seven, LP
2077718	Sullivan Wood Capital Management LLC
2077855	MVP LS FUND DXCII LLC
2078618	FT 12513
2078621	FT 12515
2078623	FT 12516
2078627	FT 12517
2078639	FT 12507
2078640	FT 12506
2078641	FT 12505
2078928	Vine Ventures III-A, LP
2078929	Vine Ventures III-B, LP
2079094	SC- House Protocol SPV a series of Allocations Funds, LLC
2079516	2Pi Inc.
2080334	Ether Machine, Inc.
2080931	AVSF - ProRata 2025, LLC
2081294	Mi-Helper Investments IV, LP
2081611	CA-0729 Fund II, a series of Roll Up Vehicles, LP
2081847	REXFORD CAPITAL INC
2082185	Equitybee 22-16554, a Series of Equitybee cFund Master LLC
2082453	AS-0706 Fund I, a series of Roll Up Vehicles, LP
2082505	Vimisci Holding Ltd
2082686	Pliyt Inc
2082903	Ford Credit Auto Owner Trust 2025-B
2082951	CA-0603 Fund II, a series of Liberty 225, LP
2083410	Porsche Leasing Ltd.
2083466	FT 12628
2083565	FT 12629
2083574	FT 12630
2083577	FT 12631
2083579	FT 12632
2083580	FT 12633
2084328	Mi-Helper Investments V, LP
2084352	Neurava Investments II, LP
2084404	GM Financial Consumer Automobile Receivables Trust 2025-4
2084480	IRONVALE CAPITAL SA LTD.
2084640	ID-0730 Fund II, a series of Smolboon AL, LP
2085025	PE Integrum II Offshore Feeder Fund, L.P.
2085026	PE Integrum II Onshore Feeder Fund, L.P.
2085067	Christian Matthew Sean
2085200	RiverNorth Financial Holdings, LLC
2085432	Honey Run Retreats, LLC
2085501	EquityZen Growth Technology Fund LLC - Series 2171
2085897	AGP DC MINATO LP
2085904	1617 50 FUNDING L.P.
2086297	RE-0903 Fund II, a series of Roll Up Vehicles, LP
2086306	RE-0904 Fund I, a series of Ryan Bowie Ventures, LP
2086457	Huaci Technology Holdings Ltd
2086467	Dimensional Datapoints, Inc.
2086606	VA-0818 Fund II, a series of Roll Up Vehicles, LP
2086696	Wrthy Co.
2086932	Fin Capital Flagship III - SBIC, LP
2087066	Anvita Capital Fund LLC
2087218	CRC CRF VII (B) SPC - CRC CRF VII Series 2025 (B) SP
2087328	B1-0903 Fund I, a series of Sajid Rahman Angel Funds, LP
2087443	ECV IL V, L.P.
2087444	ECV IL OPP III, L.P.
2087651	EVE Partners Fund I, LP
2087680	EVE Partners Fund I-A, LP
2087714	AC Europe SCSp
2087726	Abdiel Investments LP
2087760	StoneCo IV Corp
2087829	South Suburban Litho LLC
2087969	WAGMI 172 - WAGMI Master LLC
2088358	HPA 2025 CD Investment, LLC
2088392	GSO Capital Partners GP L.L.C.
2088715	OD-0915 Fund V, a series of MV Funds, LP
2088723	LY-0902 Fund I, a series of Arka Venture Fund Management, LP
2088784	Ares Master Employee Co-Invest IV Onshore LP
2088785	Ares Master Employee Co-Invest IV Onshore A LP
2088786	Ares Master Employee Co-Invest IV Offshore LP
2088787	Ares Master Employee Co-Invest IV Offshore B LP
2088817	DoveHill Industrial Investors 1, LLC
2088860	Bowin Shawna Lee
2088889	Hawk 2025, L.P.
2088955	DH Sabal House, LLC
2088956	DH WBI LLC
2089000	Align M-II, a series of SCVC Advisors, LP
2089260	CL Advisors - DVI LP
2089296	Devereux William T
2089426	Zhang Hongfei
2089500	Fuel Venture Capital Replit #1, LLC a Protected Series of Fuel Venture Capital Co-Invest Series, LLC
2089797	Citrinitas Capital Management Inc.
2089841	Ideate Better, Inc.
2090254	NE-0924 Fund I, a series of Zachary Ginsburg Funds, LP
2090458	Demand AI Group Inc
2090481	Worley Matthew Eugene
2090768	RO-09271 Fund I, a series of Roll Up Vehicles, LP
2090871	Enhance Investors SPV, L.P.
2090874	Gores Partners SPV 1, L.P.
2090884	Blackwater Capital Group Master Fund LP
2090929	Roots Unbound Holdings LLC
2091016	MM Knox Holdings LLC
2091017	Sunshine Silver Mining & Refining Co
2091286	Kingery Jonathan
2091385	Sugah Please CH Holdings LLC
2091460	Abu Dhabi Commercial Bank PJSC
2091481	Daye Wilfred ZhongKei
2091492	Valhalla Capital Partners Dynamo SPV 1 LLC
2091545	Kora Holdings VII (C) LLC
2091555	Gravel & Gold LLC
2091562	Morgan Stanley Bank of America Merrill Lynch Trust 2025-5C2
2091580	Kora Holdings VIII (C) LLC
2091629	Belfiore Michael Anthony
2091706	PW Apartments, LLC
2091716	Raveum Inc.
2091726	InvestX Series (OPN-U4), a Series of InvestX Master LLC
2091775	SE 10900 Red Circle (Minnetonka), DST
2091783	Founders Future II US, LP
2091795	Park Golf UTSA, LP
2091858	DLK CAPITAL FEEDER FUND, LP
2091875	GH Bluebird Holdings, Inc.
2091888	Zaida Partners, LP
2091918	Klein Connor R
2091929	Qoral, Inc.
2091999	DeBiasio Alice Marie
2092008	210k Capital Offshore Feeder Ltd.
2092027	WAGMI 175 - WAGMI Master LLC
2092068	Beck William Dudley
2092077	IC-SB Rio Rancho LP
2092083	Patriot Disability Advocates, Inc.
2092154	Browndorf Tod
2092243	Blue Jay Gold Corp.
2092270	NAO Cooperative Capital, Inc.
2092359	A3-0325 Fund I, a series of Roll Up Vehicles, LP
2092360	AS-0930 Fund II, a series of Zachary Ginsburg Funds, LP
2092364	Blue Marlin Therapeutics, Inc.
2092367	DoveHill Industrial Investors 2, LLC
2092394	SimplyWise SPV I Sep 2025 a Series of CGF2021 LLC
2092402	Causse Helene
2092403	Launchbay Secondary Growth Fund, L.P.
2092431	DealSage Inc.
2092454	NGP CE Co-Invest, L.P.
2092473	Apptroniks Oct 2025 a Series of Moreno VC LLC
2092475	VectorEdge Fund, LP
2092477	Anima Iris Jun 2025 a Series of CGF2021 LLC
2092480	SegTax II a Series of CGF2021 LLC
2092516	Orange Capital Ventures LP
2092560	Levery, Inc.
2092581	Equitybee 22-93185, a Series of Equitybee cFund Master LLC
2092592	Evernorth Holdings Inc.
2092593	Daniel Mark James
2092599	Persian Road II, LP
2092600	Rauch Capital Burst CLXXVIII, a series of Rauch Capital Burst, LP
2092601	Elm The Approach Investors LLC
2092604	Rauch Capital Burst CLXXV, a series of Rauch Capital Burst, LP
2092622	PNC LIHTC Fund 101, LLC
2092623	Radiologue Ventures, a Series of Decile Start Fund, LP
2092629	Rodriguez Rodriguez Miguel Angel
2092631	Ferrio Amanda
2092642	RVC AI Fund IB, a Series of SecondMarket Growth, LLC
2092648	HNZLLQ GLOBAL Ltd.
2092649	BE Patternview Data LLC
2092658	Ramston Holdings I, L.P.
2092659	Valley Forge Capital Balanced L.P.
2092664	Elevate Project Echo LLC
2092667	CCP Avondale Commons LLC
2092677	Hickory AI, Inc.
2092690	AhuoraXP Fund, LP
2092702	TI-0928 Fund I, a series of Tunitas Ventures, LP
2092705	Vy Dynamo 1 LLC
2092727	Inland NJ Senior Living DST
2092732	Deltex Capital Westside Commons LLC
2092803	BESZER LTD
2092815	HSR 128 LLC
2092816	ECHO, A SERIES OF Reflect Ventures Master 1 LLC
2092819	Knetyc Corp
2092824	Heberdev I LP
2092825	Criterion Gateway Plaza LLC
2092833	915 Silber Partners, L.L.C.
2092835	Aperture Asset-Based Finance I (DE-G), LP
2092854	Idnani Vishal
2092872	Apex MHP Fund III, LP
2092876	Geodesic Fund US, LP
2092910	Almanack Opportunity Fund, LP - Series 5
2092913	TCP Brack Investors, LP
2092915	Benavides David E
2092918	Countryside MHP LLC
2092920	LeadingReach Holdings, LLC
2092947	AirTap AI Inc.
2092948	Altek Advanced Materials Inc.
2092983	Seven Grand Growth Opportunities SPV I LP
2092986	1921 EHP, LLC
2093020	HG Vora Opportunistic Capital Fund III B Rated Feeder LP
2098	ACME UNITED CORP
21344	COCA COLA CO
217410	UNILEVER PLC
22444	COMMERCIAL METALS Co
225030	AFL CIO HOUSING INVESTMENT TRUST
277638	DAVEY TREE EXPERT CO
277948	CSX CORP
27904	DELTA AIR LINES, INC.
29989	OMNICOM GROUP INC.
30162	BNY MELLON RESEARCH GROWTH FUND, INC.
30625	FLOWSERVE CORP
312070	BARCLAYS BANK PLC
313616	DANAHER CORP /DE/
315189	DEERE & CO
315774	FORUM FUNDS
318300	PEOPLES BANCORP INC
319654	PERMIAN BASIN ROYALTY TRUST
319655	SAN JUAN BASIN ROYALTY TRUST
320121	TELOS CORP
33185	EQUIFAX INC
33213	EQT Corp
351834	SunOpta Inc.
352960	SWEDISH EXPORT CREDIT CORP /SWED/
353184	AIR T INC
353278	NOVO NORDISK A S
354647	CVB FINANCIAL CORP
357173	OLD SECOND BANCORP INC
357301	TRUSTCO BANK CORP N Y
36104	US BANCORP \\DE\\
36405	VANGUARD INDEX FUNDS
38264	Forward Industries, Inc.
40211	GATX CORP
40417	GENERAL AMERICAN INVESTORS CO INC
40545	GENERAL ELECTRIC CO
40987	GENUINE PARTS CO
43920	GREIF, INC
45012	HALLIBURTON CO
47111	HERSHEY CO
4962	AMERICAN EXPRESS CO
50471	ReposiTrak, Inc.
52848	VANGUARD WORLD FUND
63276	MATTEL INC /DE/
64463	Soluna Holdings, Inc
66496	MILLS MUSIC TRUST
66740	3M CO
67887	MOOG INC.
6845	APOGEE ENTERPRISES, INC.
6955	ENERPAC TOOL GROUP CORP
700564	FULTON FINANCIAL CORP
70145	NATIONAL FUEL GAS CO
70487	NATIONAL RESEARCH CORP
70502	NATIONAL RURAL UTILITIES COOPERATIVE FINANCE CORP /DC/
707605	AMERISERV FINANCIAL INC /PA/
70858	BANK OF AMERICA CORP /DE/
709283	QUANTUM CORP /DE/
710826	Brighthouse Funds Trust II
712050	ALTFEST L J & CO INC
712515	ELECTRONIC ARTS INC.
713676	PNC FINANCIAL SERVICES GROUP, INC.
716314	GRAHAM CORP
71691	NEW YORK TIMES CO
717538	ARROW FINANCIAL CORP
718413	COMMUNITY BANCORP /VT
718937	STAAR SURGICAL CO
720309	AMG FUNDS III
723125	MICRON TECHNOLOGY INC
723188	COMMUNITY FINANCIAL SYSTEM, INC.
72331	NORDSON CORP
726601	CAPITAL CITY BANK GROUP INC
729596	NELSON SECURITIES,INC.
73124	NORTHERN TRUST CORP
732712	VERIZON COMMUNICATIONS INC
734383	VANGUARD SPECIALIZED FUNDS
738214	AEMETIS, INC
74046	Oil-Dri Corp of America
740858	FUTUREFUNDS SERIES ACCOUNT OF EMPOWER ANNUITY INSURANCE CO of AMERICA
743367	BAR HARBOR BANKSHARES
746210	Oblong, Inc.
751978	VICOR CORP
75362	PACCAR INC
754811	U S GLOBAL INVESTORS INC
763563	CHEMUNG FINANCIAL CORP
763907	FIRST UNITED CORP/MD/
764478	BEST BUY CO INC
764624	LEGG MASON PARTNERS INCOME TRUST
766011	Caledonia Mining Corp Plc
766285	AMANA MUTUAL FUNDS TRUST
771999	DSS, INC.
77360	PENTAIR plc
773757	COLUMBIA FUNDS SERIES TRUST I
779152	JACK HENRY & ASSOCIATES INC
779335	GOULD INVESTORS L P
785557	DLH Holdings Corp.
789019	MICROSOFT CORP
790526	RadNet, Inc.
793074	WERNER ENTERPRISES INC
799850	AMERICAS CARMART INC
803578	FIREFLY NEUROSCIENCE, INC.
803649	EQC Liquidating Trust
80420	POWELL INDUSTRIES INC
804269	General Motors Financial Company, Inc.
806172	SONO TEK CORP
806633	WASATCH FUNDS TRUST
807249	GAMCO INVESTORS, INC. ET AL
811030	PROFESSIONALLY MANAGED PORTFOLIOS
811809	BHP Group Ltd
814586	Lifeway Foods, Inc.
818033	HERON THERAPEUTICS, INC. /DE/
819940	BNY Mellon Investment Funds IV, Inc.
822416	PULTEGROUP INC/MI/
822977	GOLDMAN SACHS TRUST
829323	Inuvo, Inc.
831001	CITIGROUP INC
831616	HARTMAN ALLEN R
832327	BLACKROCK INCOME TRUST, INC.
83246	HSBC USA INC /MD/
835948	BLACKROCK MUNIVEST FUND, INC.
838618	PDS Planning, Inc
844059	FRP HOLDINGS, INC.
844150	NatWest Group plc
845379	China Fund, Inc.
850027	EAGLE CAPITAL GROWTH FUND, INC.
851066	Variable Annuity-2 Series Account
851205	COGNEX CORP
851693	PRUCO LIFE VARIABLE UNIVERSAL ACCOUNT
852772	DENNY'S Corp
85535	ROYAL GOLD INC
856517	Federated Hermes Money Market Obligations Trust
857588	VARIABLE ANNUITY-2 SERIES ACCOUNT
857949	Enlightify Inc.
858446	INTERCONTINENTAL HOTELS GROUP PLC /NEW/
859737	HOLOGIC INC
860828	CAPITAL ADVISORS INC/OK
861842	CATHAY GENERAL BANCORP
862022	HUGOTON ROYALTY TRUST
862084	VANGUARD INSTITUTIONAL INDEX FUNDS
866273	MATRIX SERVICE CO
868278	ProPhase Labs, Inc.
872080	BRAUN STACEY ASSOCIATES INC
880366	LEGG MASON PARTNERS INVESTMENT TRUST
880406	Herzfeld Credit Income Fund, Inc
880417	CSB Bancorp, Inc.
881787	CROSS TIMBERS ROYALTY TRUST
882443	AMG Funds I
883782	FULTON BANK, N.A.
884624	Orthofix Medical Inc.
885307	JEWETT CAMERON TRADING CO LTD
886136	SAGA COMMUNICATIONS INC
886982	GOLDMAN SACHS GROUP INC
889169	BNY Mellon Investment Funds VII, Inc.
889512	LEGG MASON PARTNERS INSTITUTIONAL TRUST
891103	Match Group, Inc.
891190	VANGUARD ADMIRAL FUNDS
892450	KT CORP
892553	CHART INDUSTRIES INC
894158	Theriva Biologics, Inc.
89439	MUELLER INDUSTRIES INC
894556	General Enterprise Ventures, Inc.
894671	OHIO VALLEY BANC CORP
895421	MORGAN STANLEY
896159	Chubb Ltd
896878	INTUIT INC.
898293	JABIL INC
907471	PATHWARD FINANCIAL, INC.
908255	BORGWARNER INC
908311	Creative Media & Community Trust Corp
9092	BADGER METER INC
910073	FLAGSTAR BANK, NATIONAL ASSOCIATION
912463	GUESS INC
912593	SUN COMMUNITIES INC
914208	Invesco Ltd.
914775	BNY Mellon Advantage Funds, Inc.
917251	AGREE REALTY CORP
917851	Vale S.A.
918965	SCANSOURCE, INC.
919567	RENN Fund, Inc.
920760	LENNAR CORP /NEW/
92230	TRUIST FINANCIAL CORP
922869	CAPITAL ONE MASTER TRUST
923202	VANGUARD TAX-MANAGED FUNDS
923601	Algorhythm Holdings, Inc.
927628	CAPITAL ONE FINANCIAL CORP
927971	BANK OF MONTREAL /CAN/
928568	GUYASUTA INVESTMENT ADVISORS INC
930157	RENTOKIL INITIAL PLC /FI
9326	BALCHEM CORP
93556	STANLEY BLACK & DECKER, INC.
935679	ARMEN GARO H
935703	DOLLAR TREE, INC.
936468	LOCKHEED MARTIN CORP
936941	MOODY ALDRICH PARTNERS LLC
93751	STATE STREET CORP
941568	CREDIT SUISSE TRUST
945394	Service Properties Trust
946770	DEUTSCHE TELEKOM AG
947263	TORONTO DOMINION BANK
947996	Olstein Capital Management, L.P.
949858	ACHIEVE LIFE SCIENCES, INC.
9521	BANCROFT FUND LTD
96223	Jefferies Financial Group Inc.
9631	BANK OF NOVA SCOTIA
9713	Principal Life Insurance Co Separate Account B
97216	TEREX CORP
\.

-- Filings
COPY sec_filings (cik, form_type_id, filed_date, accession_filer, accession_year, accession_seq, ext_id) FROM stdin;
1000275	1	20382	950103	25	13419	1
1000275	1	20382	950103	25	13420	1
1000275	1	20382	950103	25	13421	1
1000275	1	20382	950103	25	13422	1
1000275	1	20382	950103	25	13423	1
1000275	1	20382	950103	25	13426	1
1000275	1	20382	950103	25	13427	1
1000275	1	20382	950103	25	13429	1
1000275	1	20382	950103	25	13431	1
1000275	1	20382	950103	25	13432	1
1000275	1	20382	950103	25	13433	1
1000275	1	20382	950103	25	13435	1
1000275	1	20382	950103	25	13438	1
1000275	1	20382	950103	25	13439	1
1000275	1	20382	950103	25	13440	1
1000275	1	20382	950103	25	13444	1
1000275	1	20382	950103	25	13445	1
1000275	1	20382	950103	25	13467	1
1000275	1	20382	950103	25	13468	1
1000275	1	20382	950103	25	13470	1
1000275	2	20382	950103	25	13472	1
1000275	2	20382	950103	25	13474	1
1000275	2	20382	950103	25	13475	1
1001807	3	20382	1001807	25	58	1
1001807	3	20382	1001807	25	60	1
1001807	3	20382	1001807	25	62	1
1002672	4	20382	1062993	25	16244	1
1004655	5	20382	1193125	25	244346	1
100591	6	20382	1627519	25	11	1
1006394	7	20382	1967940	25	77	1
1006830	8	20382	1437749	25	31408	1
1006837	9	20382	1006837	25	118	1
1007286	10	20382	1104659	25	101112	1
1007286	10	20382	1104659	25	101117	1
1007286	5	20382	1104659	25	101110	1
1007286	5	20382	1104659	25	101116	1
1007286	11	20382	1104659	25	101127	1
1007286	11	20382	1104659	25	101128	1
1013857	12	20382	1013857	25	218	1
1013857	9	20382	1013857	25	217	1
1016021	4	20382	1016021	25	6	1
101829	12	20382	101829	25	42	1
101829	9	20382	101829	25	40	1
1019432	13	20382	1019432	25	27	1
1020523	10	20382	745544	25	327	1
1020523	10	20382	745544	25	331	1
1020523	5	20382	745544	25	323	1
1020523	5	20382	745544	25	325	1
1020523	5	20382	745544	25	329	1
1020569	9	20382	1020569	25	195	1
1021882	5	20382	1193125	25	244346	1
1022079	12	20382	1022079	25	218	1
1022079	9	20382	1022079	25	219	1
1022671	9	20382	1104659	25	101080	1
1023512	3	20382	1628280	25	45656	1
1024305	6	20382	1674510	25	3	1
1024305	6	20382	1807136	25	3	1
1024305	6	20382	1823543	25	4	1
1024305	6	20382	1846654	25	4	1
1024305	6	20382	1972492	25	3	1
102729	9	20382	102729	25	44	1
1027552	3	20382	1027552	25	172	1
1029625	6	20382	1193125	25	245534	1
1031000	6	20382	1225208	25	8698	1
1033767	3	20382	1193125	25	244241	1
1035267	9	20382	1035267	25	206	1
1037155	10	20382	1104659	25	101113	1
1037155	10	20382	1104659	25	101118	1
1037155	5	20382	1104659	25	101110	1
1037155	5	20382	1104659	25	101116	1
1037155	11	20382	1104659	25	101127	1
1037155	11	20382	1104659	25	101128	1
1037763	4	20382	1580642	25	6637	1
1038238	6	20382	1038238	25	3	1
1038773	9	20382	1104659	25	101293	1
1039765	3	20382	1171843	25	6544	1
1040130	9	20382	1040130	25	77	1
1040188	13	20382	1040188	25	67	1
1040470	9	20382	1654954	25	12028	1
1041803	6	20382	1628280	25	45759	1
1041803	6	20382	1628280	25	45760	1
1041803	6	20382	1628280	25	45761	1
1041803	6	20382	1628280	25	45762	1
1041803	6	20382	1628280	25	45763	1
1042729	9	20382	1437749	25	31386	1
1042729	14	20382	1437749	25	31371	1
1042773	9	20382	1193125	25	245197	1
1043961	13	20382	1019432	25	27	1
1045520	1	20382	1104659	25	100956	1
1045520	1	20382	1104659	25	100957	1
1045520	1	20382	1104659	25	101055	1
1045520	1	20382	1104659	25	101086	1
10456	9	20382	1628280	25	45586	1
1045810	7	20382	1921094	25	1281	1
105319	8	20382	1193125	25	245061	1
1056696	9	20382	1193125	25	245073	1
1056823	6	20382	1437749	25	31412	1
1058307	8	20382	1437749	25	31444	1
106040	6	20382	1266824	25	213	1
1061983	7	20382	1950047	25	8095	1
1061983	6	20382	1061983	25	24	1
1061983	6	20382	1061983	25	25	1
1064642	15	20382	1193125	25	244402	1
1064642	15	20382	1193125	25	244402	1
1064642	5	20382	1193125	25	245123	1
1065280	9	20382	1065280	25	404	1
1066764	9	20382	1493152	25	18830	1
1067294	16	20382	921895	25	2774	1
1067491	3	20382	1067491	25	36	1
1067491	17	20382	1193125	25	245101	1
1067839	18	20382	1193125	25	245386	1
1068851	6	20382	1193125	25	245185	1
1068851	6	20382	1193125	25	245195	1
1069157	9	20382	1069157	25	112	1
1069899	6	20382	1104659	25	101314	1
1070524	9	20382	1140361	25	38759	1
1070844	6	20382	1213900	25	100922	1
1076378	3	20382	1193125	25	245199	1
1080576	4	20382	1080576	25	10	1
1082554	7	20382	11790	25	49	1
1082554	6	20382	1673232	25	8	1
1085041	4	20382	1085041	25	6	1
1085867	4	20382	1172661	25	4342	1
1086745	19	20382	1493152	25	18777	1
1087294	9	20382	1087294	25	12	1
1088731	4	20382	1019056	25	222	1
1089113	3	20382	1654954	25	12016	1
109380	6	20382	109380	25	126	1
1094285	8	20382	1548776	25	8	1
1095981	9	20382	1193125	25	244275	1
1098972	6	20382	1193125	25	245089	1
1100663	20	20382	940400	25	4672	1
1100663	21	20382	1417835	25	234	1
1103646	13	20382	1103646	25	6	1
1104485	9	20382	1104485	25	150	1
1106566	6	20382	1565687	25	90	1
1106578	7	20382	11790	25	49	1
1107843	6	20382	1254781	25	5	1
1108524	6	20382	1108524	25	177	1
1108893	4	20382	1108893	25	7	1
1109242	9	20382	1171843	25	6566	1
1111565	22	20382	940400	25	4981	1
1111565	22	20382	940400	25	4984	1
1111565	22	20382	940400	25	4985	1
1111565	22	20382	940400	25	4987	1
1111565	22	20382	940400	25	4988	1
1111565	22	20382	940400	25	4989	1
1111565	22	20382	940400	25	4991	1
1111565	22	20382	940400	25	4993	1
1111565	22	20382	940400	25	4994	1
1111565	22	20382	940400	25	4995	1
1111565	22	20382	940400	25	4996	1
1111565	22	20382	940400	25	4997	1
1111928	6	20382	1111928	25	155	1
1111928	6	20382	1111928	25	157	1
1111928	6	20382	1111928	25	159	1
1112668	6	20382	1137789	25	274	1
1114446	1	20382	1839882	25	59328	1
1114446	1	20382	1839882	25	59407	1
1114446	1	20382	1839882	25	59412	1
1114446	1	20382	1839882	25	59415	1
1114446	1	20382	1839882	25	59418	1
1114446	1	20382	1839882	25	59419	1
1114446	1	20382	1839882	25	59422	1
1114446	1	20382	1839882	25	59435	1
1114446	1	20382	1839882	25	59441	1
1114446	1	20382	1839882	25	59448	1
1114446	1	20382	1839882	25	59449	1
1114446	1	20382	1839882	25	59464	1
1114446	1	20382	1839882	25	59472	1
1114446	1	20382	1839882	25	59474	1
1114446	1	20382	1839882	25	59478	1
1114446	1	20382	1839882	25	59482	1
1114446	1	20382	1839882	25	59493	1
1114446	1	20382	1839882	25	59495	1
1114446	1	20382	1839882	25	59546	1
1114446	1	20382	1839882	25	59595	1
1114446	1	20382	1839882	25	59615	1
1114446	1	20382	1839882	25	59627	1
1114446	1	20382	1839882	25	59631	1
1114446	1	20382	1839882	25	59634	1
1114446	1	20382	1839882	25	59635	1
1114446	1	20382	1839882	25	59636	1
1114446	1	20382	1839882	25	59637	1
1114446	1	20382	1839882	25	59638	1
1114446	1	20382	1839882	25	59639	1
1114446	1	20382	1839882	25	59640	1
1114446	1	20382	1839882	25	59641	1
1114446	1	20382	1839882	25	59643	1
1114446	1	20382	1839882	25	59644	1
1114446	1	20382	1839882	25	59645	1
1114446	1	20382	1839882	25	59647	1
1114446	1	20382	1839882	25	59649	1
1114446	1	20382	1839882	25	59652	1
1114446	1	20382	1839882	25	59654	1
1114446	1	20382	1839882	25	59656	1
1114446	1	20382	1839882	25	59657	1
1114446	1	20382	1839882	25	59658	1
1114446	1	20382	1839882	25	59660	1
1114446	1	20382	1839882	25	59662	1
1114446	1	20382	1839882	25	59664	1
1114446	1	20382	1839882	25	59668	1
1114446	1	20382	1839882	25	59669	1
1114446	1	20382	1839882	25	59672	1
1114446	1	20382	1839882	25	59674	1
1114446	1	20382	1839882	25	59676	1
1114446	1	20382	1839882	25	59677	1
1114446	1	20382	1839882	25	59678	1
1114446	1	20382	1839882	25	59679	1
1114446	1	20382	1839882	25	59691	1
1114446	1	20382	1839882	25	59693	1
1114446	23	20382	1839882	25	59548	1
1114446	2	20382	1839882	25	59665	1
1114618	4	20382	1114618	25	4	1
1115055	6	20382	1115055	25	169	1
1115055	6	20382	1115055	25	178	1
1116578	3	20382	1654954	25	11995	1
1116578	3	20382	1654954	25	12001	1
1119639	3	20382	1292814	25	3575	1
1120193	9	20382	1193125	25	244271	1
1123274	4	20382	1123274	25	14	1
1123778	4	20382	1123778	25	7	1
1123799	3	20382	1193125	25	245107	1
1123799	3	20382	1193125	25	245284	1
1123812	4	20382	1123812	25	16	1
1124198	9	20382	1124198	25	67	1
1124462	7	20382	1628280	25	45709	1
1124462	6	20382	1628280	25	45726	1
1126741	24	20382	1104659	25	101303	1
1126741	9	20382	1104659	25	101048	1
1126741	9	20382	1104659	25	101301	1
1127371	6	20382	1628280	25	45765	1
1128251	4	20382	1140361	25	38683	1
1128928	9	20382	1193125	25	244355	1
1130310	9	20382	1193125	25	245197	1
1130423	6	20382	1111928	25	157	1
1131343	3	20382	1213900	25	100529	1
1131399	3	20382	1654954	25	11990	1
1131399	3	20382	1654954	25	11992	1
1131399	3	20382	1654954	25	11999	1
1133421	12	20382	1133421	25	53	1
1133421	9	20382	1133421	25	52	1
1133438	25	20382	1193125	25	245176	1
1133438	25	20382	1193125	25	245176	1
1133438	25	20382	1193125	25	245176	1
1135951	3	20382	1575872	25	627	1
1137789	6	20382	1137789	25	266	1
1137789	6	20382	1137789	25	267	1
1137789	6	20382	1137789	25	268	1
1137789	6	20382	1137789	25	269	1
1137789	6	20382	1137789	25	270	1
1137789	6	20382	1137789	25	271	1
1137789	6	20382	1137789	25	272	1
1137789	6	20382	1137789	25	273	1
1137789	6	20382	1137789	25	274	1
1137789	6	20382	1137789	25	275	1
1140019	5	20382	1140019	25	85	1
1140019	5	20382	1140019	25	86	1
1140019	5	20382	1140019	25	87	1
1140625	3	20382	1171843	25	6543	1
1140771	4	20382	1140771	25	8	1
1140859	7	20382	1959173	25	6517	1
1140859	6	20382	1633897	25	11	1
1141819	26	20382	894189	25	11606	1
1141819	22	20382	894189	25	11514	1
1141819	22	20382	894189	25	11518	1
1141819	22	20382	894189	25	11519	1
1141819	22	20382	894189	25	11520	1
1143335	6	20382	1143335	25	13	1
1144879	9	20382	1493152	25	18800	1
1145713	6	20382	1625641	25	163	1
1156039	12	20382	1156039	25	136	1
1156039	9	20382	1193125	25	244191	1
1157408	6	20382	1280233	25	5	1
1159508	1	20382	950103	25	13460	1
1159555	6	20382	891103	25	171	1
1160106	3	20382	1654954	25	12019	1
1162387	27	20382	1193125	25	244829	1
1162387	2	20382	1193125	25	244839	1
1163321	27	20382	1193125	25	244829	1
1163321	2	20382	1193125	25	244837	1
1163653	1	20382	1104659	25	101149	1
1163653	1	20382	1104659	25	101227	1
1163653	1	20382	1104659	25	101308	1
1163739	8	20382	1163739	25	27	1
1163739	6	20382	1163739	25	29	1
1164771	3	20382	1654954	25	11983	1
1166663	28	20382	919574	25	6209	1
1172178	9	20382	1493152	25	18736	1
1174940	9	20382	1493152	25	18725	1
1175980	5	20382	1133228	25	11007	1
1175981	5	20382	1133228	25	11009	1
1176334	6	20382	1203720	25	6	1
1177394	7	20382	1950047	25	8098	1
1178253	6	20382	1178253	25	7	1
1185476	6	20382	1225208	25	8684	1
1185533	6	20382	1185533	25	5	1
1187903	6	20382	1214659	25	15163	1
1187904	6	20382	1214659	25	15165	1
1190149	6	20382	1115055	25	169	1
1190775	6	20382	1193125	25	245241	1
1191508	7	20382	1959173	25	6517	1
1195384	6	20382	1225208	25	8690	1
1196727	6	20382	1225208	25	8711	1
1196746	6	20382	1225208	25	8709	1
1197649	7	20382	1921094	25	1281	1
1201489	6	20382	1137789	25	273	1
1201792	8	20382	1123292	25	579	1
1201792	6	20382	1123292	25	580	1
1201852	6	20382	1115055	25	178	1
1203720	6	20382	1203720	25	6	1
1204385	6	20382	1628280	25	45677	1
1204831	6	20382	1225208	25	8689	1
1207097	6	20382	1437749	25	31395	1
1208385	6	20382	1225208	25	8691	1
1208752	8	20382	1213900	25	100803	1
1208752	6	20382	1213900	25	100808	1
1209154	6	20382	1225208	25	8688	1
1212545	8	20382	1628280	25	45734	1
1212545	6	20382	1628280	25	45735	1
1212545	9	20382	1628280	25	45685	1
1215315	6	20382	1215315	25	9	1
1215920	6	20382	40417	25	46	1
1218683	9	20382	1213900	25	100690	1
12208	6	20382	1993147	25	6	1
1222781	6	20382	1137789	25	269	1
1225676	29	20382	1104659	25	100991	1
1227523	16	20382	1193125	25	245153	1
1227848	19	20382	1683168	25	7688	1
1230524	30	20382	1477932	25	7668	1
1230869	6	20382	1510281	25	518	1
1230869	19	20382	1062993	25	16248	1
1235793	6	20382	1628280	25	45763	1
1238039	6	20382	891103	25	175	1
1239956	6	20382	1061983	25	24	1
1241560	6	20382	1104659	25	101314	1
1246840	6	20382	1213900	25	100830	1
1246840	19	20382	1213900	25	100831	1
1248110	6	20382	1008886	25	279	1
1251987	6	20382	1251987	25	8	1
1254781	6	20382	1254781	25	5	1
1260221	6	20382	1193125	25	245267	1
1262182	7	20382	1628280	25	45599	1
1263072	29	20382	1104659	25	100993	1
1263077	29	20382	1104659	25	100977	1
1264136	3	20382	1193125	25	244201	1
1265886	6	20382	1550695	25	111	1
1268406	7	20382	1959173	25	6508	1
1268406	6	20382	1268406	25	31	1
1269026	6	20382	1493152	25	18717	1
1271850	6	20382	1225208	25	8685	1
1272164	4	20382	1272164	25	6	1
1273087	28	20382	1104659	25	101225	1
1274494	9	20382	1274494	25	77	1
1275187	31	20382	1140361	25	38817	1
1280233	6	20382	1280233	25	5	1
1283699	6	20382	1140361	25	38812	1
1284208	4	20382	1193125	25	244741	1
1287032	1	20382	1287032	25	311	1
1287032	1	20382	1287032	25	312	1
1287614	6	20382	891103	25	165	1
1291446	32	20382	1104659	25	101274	1
1293613	33	20382	1213900	25	100852	1
1294693	6	20382	1108524	25	177	1
1295399	6	20382	1225208	25	8710	1
1297107	9	20382	1193125	25	243947	1
1300306	29	20382	1300306	25	10	1
1301120	6	20382	1301120	25	9	1
1301236	9	20382	1193125	25	245218	1
1301396	13	20382	1301396	25	12	1
1301787	6	20382	1104659	25	101177	1
1309092	6	20382	1193125	25	245138	1
1311755	19	20382	927089	25	195	1
1313536	9	20382	1193125	25	245218	1
1314760	6	20382	1193125	25	244582	1
1315059	4	20382	1315059	25	9	1
1316944	9	20382	1316944	25	200	1
1318220	9	20382	1104659	25	101248	1
1318605	18	20382	1104659	25	101278	1
1319947	6	20382	1225208	25	8686	1
1319947	6	20382	1225208	25	8687	1
1319947	6	20382	1225208	25	8688	1
1319947	6	20382	1225208	25	8689	1
1319947	6	20382	1225208	25	8690	1
1319947	6	20382	1225208	25	8691	1
1319947	6	20382	1225208	25	8692	1
1319947	6	20382	1225208	25	8693	1
1319947	6	20382	1225208	25	8694	1
1319947	6	20382	1225208	25	8695	1
1319947	6	20382	1225208	25	8696	1
1319947	6	20382	1225208	25	8697	1
1319947	6	20382	1225208	25	8698	1
1319947	6	20382	1225208	25	8699	1
1319947	6	20382	1225208	25	8700	1
1320350	9	20382	1193125	25	245196	1
1321392	7	20382	1969223	25	865	1
1324279	4	20382	1062993	25	16236	1
1325814	9	20382	1325814	25	197	1
1325878	9	20382	1325878	25	220	1
1326205	6	20382	1185185	25	1504	1
1326205	6	20382	1185185	25	1506	1
1326205	6	20382	1185185	25	1508	1
1326771	9	20382	1326771	25	192	1
1326801	7	20382	1921094	25	1283	1
1328792	6	20382	1104659	25	101327	1
1329099	3	20382	1193125	25	244235	1
1329842	9	20382	1654954	25	12026	1
1330399	9	20382	1193125	25	244354	1
1331252	6	20382	1225208	25	8700	1
1331451	9	20382	1331451	25	208	1
1331463	9	20382	1331463	25	200	1
1331465	9	20382	1331465	25	241	1
1331754	9	20382	1331754	25	207	1
1331757	9	20382	1331757	25	181	1
1331971	34	20382	1193125	25	244951	1
1331971	34	20382	1193125	25	244961	1
1331971	34	20382	1193125	25	244963	1
1331971	34	20382	1193125	25	244977	1
1332784	6	20382	1193125	25	245534	1
1333986	6	20382	1628280	25	45723	1
1334388	19	20382	1140361	25	38768	1
1334429	16	20382	921895	25	2774	1
1334871	6	20382	1628280	25	45765	1
1336706	9	20382	1336706	25	6	1
1339005	9	20382	1140361	25	38733	1
1339688	6	20382	2064835	25	18	1
1341317	9	20382	1104659	25	101247	1
1341439	7	20382	1959173	25	6511	1
1341439	7	20382	1959173	25	6513	1
1347242	9	20382	1753926	25	1636	1
1347557	3	20382	1171843	25	6536	1
1349123	6	20382	1137789	25	266	1
1350156	12	20382	1079973	25	1628	1
1350487	35	20382	1214659	25	15115	1
1350487	35	20382	1214659	25	15115	1
1352010	7	20382	1950047	25	8089	1
1352010	9	20382	1352010	25	50	1
1352280	20	20382	1193125	25	244534	1
1354457	36	20382	1354457	25	1044	1
1354457	36	20382	1354457	25	1045	1
1354457	37	20382	1354457	25	1046	1
1355444	3	20382	1292814	25	3577	1
1355444	21	20382	876661	25	797	1
1355848	24	20382	1683168	25	7698	1
1355848	9	20382	1683168	25	7700	1
1356576	9	20382	1356576	25	65	1
1356826	6	20382	1104659	25	101327	1
1356849	6	20382	1356849	25	22	1
1357717	6	20382	1357717	25	14	1
1361896	38	20382	1731122	25	1419	1
1362468	6	20382	1845661	25	3	1
1362468	6	20382	1964741	25	3	1
1362468	6	20382	1975499	25	3	1
1362468	6	20382	2066736	25	2	1
1362468	9	20382	1362468	25	46	1
1362495	6	20382	1213900	25	100920	1
1363558	6	20382	1193125	25	244520	1
1363598	39	20382	1363598	25	6	1
1364885	40	20382	1628280	25	45597	1
1369085	3	20382	1279569	25	1135	1
1372612	7	20382	1921094	25	1282	1
1375666	41	20382	1213900	25	100709	1
1375877	3	20382	1104659	25	101024	1
1378544	6	20382	1111928	25	159	1
1380106	6	20382	1380106	25	190	1
1381979	6	20382	1381979	25	4	1
1382617	6	20382	1193125	25	245534	1
1383951	1	20382	1104659	25	101149	1
1383951	1	20382	1104659	25	101227	1
1383951	1	20382	1104659	25	101308	1
1387386	4	20382	1398344	25	19432	1
1387467	6	20382	1387467	25	58	1
1387467	6	20382	1387467	25	60	1
1387818	4	20382	1387818	25	5	1
1389545	9	20382	1829126	25	8295	1
1391842	29	20382	905148	25	3644	1
1393657	6	20382	1628280	25	45680	1
1393818	6	20382	1213900	25	100922	1
1394866	4	20382	1394866	25	5	1
1397187	9	20382	1397187	25	45	1
1397795	12	20382	1213900	25	100811	1
1397911	16	20382	1193125	25	245153	1
1399318	8	20382	1903596	25	496	1
1399318	6	20382	1903596	25	497	1
1404071	6	20382	1213900	25	100922	1
1404074	8	20382	1213900	25	100810	1
1404074	6	20382	1213900	25	100922	1
1404075	8	20382	1213900	25	100810	1
1404075	6	20382	1213900	25	100920	1
1404077	8	20382	1213900	25	100810	1
1404077	6	20382	1213900	25	100920	1
1404655	7	20382	1959173	25	6507	1
1407583	42	20382	1493152	25	18794	1
1409970	6	20382	1409970	25	67	1
1410600	8	20382	921895	25	2785	1
1410600	6	20382	921895	25	2786	1
1412163	29	20382	905148	25	3640	1
1412408	6	20382	1412408	25	90	1
1412408	6	20382	1412408	25	92	1
1412408	6	20382	1412408	25	94	1
1412408	6	20382	1412408	25	96	1
1412408	6	20382	1412408	25	98	1
1412408	6	20382	1412408	25	100	1
1413329	9	20382	1628280	25	45579	1
1413837	9	20382	1104659	25	101261	1
1414767	43	20382	1493152	25	18799	1
1415515	6	20382	1550695	25	99	1
1417038	6	20382	1193125	25	245185	1
1418329	4	20382	1140361	25	38719	1
1419275	8	20382	1185185	25	1502	1
1419828	1	20382	950103	25	13459	1
1419828	1	20382	950103	25	13465	1
1419828	1	20382	1193125	25	243863	1
1419828	1	20382	1193125	25	244000	1
1419828	1	20382	1193125	25	244001	1
1419828	1	20382	1193125	25	244439	1
1419828	1	20382	1193125	25	244615	1
1419828	1	20382	1193125	25	244622	1
1419828	1	20382	1193125	25	244624	1
1419828	1	20382	1193125	25	244687	1
1419828	1	20382	1193125	25	244702	1
1419828	1	20382	1193125	25	244715	1
1419828	1	20382	1193125	25	244729	1
1419828	1	20382	1193125	25	244773	1
1419828	1	20382	1193125	25	244815	1
1419828	1	20382	1193125	25	244867	1
1419828	1	20382	1193125	25	244879	1
1419828	1	20382	1193125	25	244882	1
1419828	1	20382	1193125	25	244895	1
1419828	1	20382	1193125	25	244934	1
1419828	1	20382	1193125	25	245091	1
1419828	1	20382	1193125	25	245095	1
1419828	1	20382	1193125	25	245162	1
1419828	1	20382	1193125	25	245182	1
1419828	1	20382	1193125	25	245186	1
1419828	1	20382	1193125	25	245203	1
1419828	1	20382	1193125	25	245213	1
1419828	1	20382	1193125	25	245215	1
1419828	1	20382	1193125	25	245219	1
1419828	1	20382	1193125	25	245229	1
1419828	1	20382	1193125	25	245242	1
1419828	1	20382	1193125	25	245243	1
1419828	1	20382	1193125	25	245254	1
1419828	1	20382	1193125	25	245255	1
1419828	1	20382	1193125	25	245259	1
1419828	1	20382	1193125	25	245260	1
1419828	1	20382	1193125	25	245264	1
1419828	1	20382	1193125	25	245281	1
1419828	1	20382	1193125	25	245364	1
1419828	1	20382	1193125	25	245365	1
1419828	1	20382	1193125	25	245366	1
1419828	1	20382	1193125	25	245369	1
1419828	1	20382	1193125	25	245374	1
1419828	1	20382	1193125	25	245376	1
1419828	1	20382	1193125	25	245377	1
1419828	1	20382	1193125	25	245378	1
1419828	1	20382	1193125	25	245383	1
1419828	1	20382	1193125	25	245384	1
1419828	1	20382	1193125	25	245388	1
1419828	1	20382	1193125	25	245389	1
1419828	1	20382	1193125	25	245390	1
1419828	2	20382	1193125	25	244002	1
1419828	2	20382	1193125	25	244007	1
1419828	2	20382	1193125	25	244531	1
1419828	2	20382	1193125	25	244939	1
1420520	9	20382	1683168	25	7691	1
1421876	3	20382	1171843	25	6542	1
1422651	7	20382	1950047	25	8086	1
1423053	28	20382	1104659	25	101328	1
1423053	28	20382	1104659	25	101330	1
1423221	8	20382	1423221	25	33	1
1426748	4	20382	1426748	25	5	1
1427350	4	20382	1427350	25	5	1
1428205	9	20382	1428205	25	224	1
1428205	9	20382	1428205	25	225	1
1429764	42	20382	1493152	25	18787	1
1431768	7	20382	1950047	25	8087	1
1432353	15	20382	1432353	25	564	1
1432353	15	20382	1432353	25	564	1
1434265	44	20382	1193125	25	244292	1
1434316	8	20382	1193125	25	245098	1
1434316	6	20382	1193125	25	245106	1
1434614	45	20382	1193125	25	243882	1
1436252	6	20382	1193125	25	245586	1
1436468	8	20382	1094891	25	79	1
1438093	7	20382	1959173	25	6516	1
1438848	4	20382	1172661	25	4340	1
1442236	9	20382	1193805	25	1489	1
1443006	8	20382	1094891	25	75	1
1445930	3	20382	1193125	25	244198	1
1446687	16	20382	1104659	25	100924	1
1446687	16	20382	1104659	25	101239	1
1451612	6	20382	1451612	25	12	1
1453687	9	20382	1453687	25	106	1
1455515	29	20382	905148	25	3646	1
1455971	6	20382	1213900	25	100863	1
1456048	4	20382	1456048	25	9	1
1461945	8	20382	921895	25	2782	1
1461946	8	20382	921895	25	2782	1
1461947	8	20382	921895	25	2782	1
1461948	8	20382	921895	25	2782	1
1462171	8	20382	921895	25	2782	1
1462488	6	20382	1137789	25	267	1
1463814	46	20382	1193125	25	244341	1
1463814	46	20382	1193125	25	244366	1
1463814	46	20382	1193125	25	244367	1
1463814	46	20382	1193125	25	244368	1
1463814	46	20382	1193125	25	244370	1
1463814	46	20382	1193125	25	244371	1
1464423	9	20382	1193125	25	245225	1
1464591	3	20382	950103	25	13416	1
1464694	6	20382	1213900	25	100922	1
1464695	6	20382	1213900	25	100922	1
1464695	19	20382	1213900	25	100923	1
1467837	6	20382	2064835	25	18	1
1467858	12	20382	1467858	25	143	1
1467858	9	20382	1467858	25	141	1
1468091	3	20382	1468091	25	90	1
1469167	6	20382	1137789	25	272	1
1469241	6	20382	351834	25	5	1
1469336	13	20382	902664	25	4475	1
1469336	13	20382	902664	25	4477	1
1469336	13	20382	902664	25	4479	1
1469336	13	20382	902664	25	4480	1
1469336	28	20382	902664	25	4474	1
1469336	28	20382	902664	25	4476	1
1469336	28	20382	902664	25	4478	1
1472033	47	20382	1193805	25	1483	1
1472246	48	20382	1104659	25	101077	1
1473334	9	20382	1493152	25	18807	1
1475260	3	20382	1475260	25	42	1
1475841	9	20382	1475841	25	54	1
1476034	6	20382	1720773	25	5	1
1476034	9	20382	1104659	25	101041	1
1476963	9	20382	1079973	25	1626	1
1477081	3	20382	1493152	25	18773	1
1477720	7	20382	1950047	25	8092	1
1479026	22	20382	940400	25	4926	1
1479026	22	20382	940400	25	4927	1
1479026	22	20382	940400	25	4929	1
1479026	22	20382	940400	25	4931	1
1479026	22	20382	940400	25	4933	1
1479026	22	20382	940400	25	4934	1
1479026	22	20382	940400	25	4935	1
1479026	22	20382	940400	25	4936	1
1479026	22	20382	940400	25	4937	1
1479026	22	20382	940400	25	4939	1
1479026	22	20382	940400	25	4940	1
1479026	22	20382	940400	25	4941	1
1479026	22	20382	940400	25	4942	1
1479026	22	20382	940400	25	4943	1
1479026	22	20382	940400	25	4944	1
1479026	22	20382	940400	25	4945	1
1479026	22	20382	940400	25	4946	1
1479026	22	20382	940400	25	4947	1
1479026	22	20382	940400	25	4948	1
1479026	22	20382	940400	25	4949	1
1479026	22	20382	940400	25	4950	1
1479026	22	20382	940400	25	4951	1
1479026	22	20382	940400	25	4952	1
1479026	22	20382	940400	25	4954	1
1479026	22	20382	940400	25	4957	1
1479026	22	20382	940400	25	4958	1
1479026	22	20382	940400	25	4961	1
1479026	22	20382	940400	25	4963	1
1479026	22	20382	940400	25	4964	1
1479026	22	20382	940400	25	4965	1
1479026	22	20382	940400	25	4966	1
1479026	22	20382	940400	25	4968	1
1479026	22	20382	940400	25	4971	1
1479026	22	20382	940400	25	4972	1
1479026	22	20382	940400	25	4973	1
1479026	22	20382	940400	25	4974	1
1479026	22	20382	940400	25	4977	1
1479026	22	20382	940400	25	4979	1
1479026	22	20382	940400	25	5001	1
1479079	6	20382	1479079	25	8	1
1479599	49	20382	1479599	25	8	1
1482541	9	20382	1493152	25	18732	1
1484447	8	20382	1123292	25	579	1
1484447	6	20382	1123292	25	580	1
14846	6	20382	1214659	25	15163	1
14846	6	20382	1214659	25	15164	1
14846	6	20382	1214659	25	15165	1
1488039	8	20382	1193125	25	245087	1
1488039	6	20382	1193125	25	245114	1
1488168	6	20382	1488168	25	3	1
1488864	6	20382	1193125	25	244560	1
1489090	38	20382	1731122	25	1417	1
1491874	7	20382	1491874	25	5	1
1491998	4	20382	1140361	25	38721	1
1492422	7	20382	1959173	25	6509	1
1493580	22	20382	940400	25	4999	1
1493580	22	20382	940400	25	5000	1
1494904	9	20382	1193125	25	245273	1
1499422	9	20382	1437749	25	31363	1
1500375	19	20382	927089	25	195	1
1501697	28	20382	902664	25	4474	1
1503584	3	20382	950157	25	881	1
1504678	6	20382	1437749	25	31421	1
1506184	3	20382	1193125	25	243950	1
1506184	3	20382	1193125	25	245272	1
1506251	24	20382	1213900	25	100559	1
1506251	9	20382	1213900	25	100847	1
1506293	6	20382	1643573	25	7	1
1506427	6	20382	1214659	25	15174	1
1509261	9	20382	1104659	25	101282	1
1510281	6	20382	1510281	25	518	1
1510281	19	20382	1062993	25	16248	1
1511393	6	20382	1387467	25	60	1
1512442	6	20382	1628280	25	45723	1
1514597	3	20382	1171843	25	6549	1
1516212	5	20382	1193125	25	245157	1
1518042	22	20382	910472	25	2191	1
1518042	22	20382	910472	25	2192	1
1518042	22	20382	910472	25	2193	1
1518042	22	20382	910472	25	2194	1
1518042	22	20382	910472	25	2195	1
1519339	6	20382	2050755	25	19	1
1519469	3	20382	1171843	25	6554	1
1520006	9	20382	1520006	25	215	1
1522325	6	20382	1387467	25	58	1
1524273	6	20382	891103	25	162	1
1524348	15	20382	1999371	25	15733	1
1524348	15	20382	1999371	25	15733	1
1524472	6	20382	2040538	25	2	1
1524513	20	20382	940400	25	4673	1
1525201	8	20382	2091286	25	3	1
1526243	9	20382	1104659	25	101285	1
1527641	4	20382	1527641	25	8	1
1527762	6	20382	2091481	25	2	1
1528396	6	20382	1586253	25	12	1
1528396	6	20382	1784996	25	28	1
1529113	13	20382	902664	25	4479	1
1531152	6	20382	1531152	25	122	1
1531183	6	20382	1531183	25	7	1
1531809	4	20382	1531809	25	6	1
1533551	4	20382	1533551	25	6	1
1533646	6	20382	1225208	25	8694	1
1534708	50	20343	1493152	25	13186	1
1534708	42	20382	1493152	25	18826	1
1534995	6	20382	1137789	25	270	1
1535602	4	20382	1535602	25	21	1
1535631	4	20382	1535631	25	14	1
1536755	4	20382	1536755	25	15	1
1537137	3	20382	1104659	25	100932	1
1537319	4	20382	1537319	25	5	1
1537805	46	20382	1193125	25	244342	1
1537805	46	20382	1193125	25	244343	1
1537805	46	20382	1193125	25	244344	1
1537805	46	20382	1193125	25	244345	1
1538822	9	20382	1104659	25	101241	1
1540305	51	20382	894189	25	11595	1
1540305	51	20382	894189	25	11595	1
1541507	52	20382	1193125	25	244918	1
1542108	4	20382	1542108	25	6	1
1542826	53	20382	1542826	25	7	1
1545193	6	20382	712515	25	57	1
1546865	4	20382	1546865	25	7	1
1547361	27	20382	1539497	25	2756	1
1547361	46	20382	1539497	25	2750	1
1547361	2	20382	1539497	25	2746	1
1547361	2	20382	1539497	25	2748	1
1547361	2	20382	1539497	25	2752	1
1547361	2	20382	1539497	25	2754	1
1547576	54	20382	1829126	25	8314	1
1547576	55	20382	1829126	25	8303	1
1547576	56	20382	1829126	25	8312	1
1548754	6	20382	351834	25	17	1
1548776	8	20382	1548776	25	8	1
1550695	36	20382	1354457	25	1044	1
1550695	6	20382	1550695	25	99	1
1550695	6	20382	1550695	25	101	1
1550695	6	20382	1550695	25	103	1
1550695	6	20382	1550695	25	105	1
1550695	6	20382	1550695	25	107	1
1550695	6	20382	1550695	25	109	1
1550695	6	20382	1550695	25	111	1
1550695	9	20382	1140361	25	38741	1
1550695	57	20382	1140361	25	38746	1
1550695	58	20382	1140361	25	38742	1
1550695	58	20382	1140361	25	38743	1
1550695	58	20382	1140361	25	38744	1
1550695	58	20382	1140361	25	38745	1
1551423	59	20382	1208646	25	61	1
1551778	7	20382	1950047	25	8095	1
1551778	6	20382	1061983	25	25	1
1551964	59	20382	1208646	25	61	1
1552111	59	20382	1208646	25	61	1
1552275	9	20382	1193125	25	244314	1
1553788	38	20382	1731122	25	1417	1
1553788	38	20382	1731122	25	1419	1
1553788	38	20382	1731122	25	1421	1
1553788	38	20382	1731122	25	1422	1
1553846	23	20382	1178913	25	3532	1
1553846	3	20382	1178913	25	3530	1
1555694	6	20382	1550695	25	109	1
1559109	20	20382	940400	25	4676	1
1559706	28	20382	902664	25	4494	1
1560143	9	20382	1683168	25	7683	1
1560672	60	20382	1999371	25	15716	1
1561330	4	20382	1561330	25	5	1
1563577	9	20382	1193125	25	245093	1
1564521	6	20382	1412408	25	98	1
1564708	9	20382	1564708	25	550	1
1565687	6	20382	1565687	25	90	1
1566388	8	20382	2091286	25	2	1
1568194	9	20382	1104659	25	101259	1
1568884	6	20382	1111928	25	155	1
1569866	6	20382	1193125	25	245564	1
1569994	9	20382	1437749	25	31417	1
1571561	6	20382	1571561	25	3	1
1573575	4	20382	1573575	25	11	1
1573840	6	20382	1573840	25	2	1
1576359	6	20382	1140361	25	38812	1
1576360	6	20382	1140361	25	38812	1
1576704	4	20382	1576704	25	16	1
1576942	6	20382	1628280	25	45766	1
1578422	59	20382	1853620	25	256	1
1579157	9	20382	1193125	25	244278	1
1586253	6	20382	1586253	25	12	1
1587981	59	20382	1888524	25	17913	1
1587982	35	20382	1213900	25	100790	1
1587982	35	20382	1213900	25	100790	1
1589390	61	20382	1580642	25	6657	1
1590073	4	20382	1590073	25	8	1
1590715	28	20382	1104659	25	101328	1
1590750	24	20382	1193125	25	245209	1
1590750	9	20382	1193125	25	245206	1
1591890	9	20382	1493152	25	18733	1
1593001	9	20382	1493152	25	18737	1
1593001	9	20382	1493152	25	18782	1
1594540	4	20382	1594540	25	3	1
1595097	6	20382	1193125	25	245262	1
1595248	9	20382	1437749	25	31382	1
1595527	9	20382	1104659	25	101262	1
1595726	59	20382	1888524	25	17857	1
1596355	4	20382	1596355	25	6	1
1596532	6	20382	1596532	25	279	1
1597213	6	20382	1140361	25	38812	1
1598504	6	20382	1493152	25	18717	1
1598550	4	20382	1062993	25	16226	1
1598599	13	20382	950103	25	13417	1
1599404	4	20382	1599404	25	7	1
1599576	4	20382	1599576	25	9	1
1601046	6	20382	1781319	25	4	1
1601046	6	20382	2069480	25	5	1
1601607	6	20382	1104659	25	101314	1
1601705	59	20382	1888524	25	17865	1
1603163	6	20382	351834	25	7	1
1603527	7	20382	1959173	25	6507	1
1603923	9	20382	1603923	25	156	1
1604083	59	20382	1888524	25	17899	1
1604821	31	20382	1104659	25	100935	1
1605808	6	20382	1596532	25	279	1
1609098	28	20382	919574	25	6210	1
1610853	9	20382	1104659	25	100920	1
1611052	7	20382	1950047	25	8088	1
1611647	8	20382	929638	25	3964	1
1611647	6	20382	929638	25	3965	1
1613103	9	20382	1628280	25	45695	1
1615219	9	20382	1615219	25	148	1
1615219	62	20382	1628280	25	45619	1
1615905	60	20382	1999371	25	15758	1
1616026	4	20382	1616026	25	7	1
1616262	6	20382	1193125	25	245563	1
1616262	6	20382	1193125	25	245564	1
1616533	30	20382	1616533	25	61	1
1616763	29	20382	1104659	25	100982	1
1616765	29	20382	1104659	25	100995	1
1616905	8	20382	1493152	25	18766	1
1617242	9	20382	1617242	25	68	1
1617553	6	20382	1859442	25	4	1
1617959	59	20382	1888524	25	17911	1
1620305	59	20382	1888524	25	17907	1
1620737	3	20382	1628280	25	45674	1
1621221	19	20382	921895	25	2780	1
1621368	59	20382	1888524	25	17918	1
1622244	9	20382	1493152	25	18756	1
1622634	6	20382	47111	25	171	1
1622765	59	20382	1853620	25	257	1
1624510	4	20382	1624510	25	9	1
1625641	6	20382	1625641	25	163	1
1627519	6	20382	1627519	25	11	1
1628112	59	20382	1888524	25	17891	1
1628226	6	20382	1193125	25	245134	1
1628369	9	20382	1193125	25	245231	1
1628427	6	20382	1193125	25	245195	1
1628498	7	20382	1972481	25	255	1
1629963	7	20382	1959173	25	6510	1
1629996	4	20382	1629996	25	6	1
1631596	12	20382	1628280	25	45722	1
1631596	9	20382	1628280	25	45715	1
1632665	4	20382	1632665	25	8	1
1632814	59	20382	1888524	25	17863	1
1633343	4	20382	1140361	25	38720	1
1633897	6	20382	1633897	25	11	1
1633910	4	20382	1172661	25	4345	1
1633910	63	20382	1172661	25	4343	1
1633910	63	20382	1172661	25	4344	1
1635342	4	20382	1635342	25	7	1
1638600	64	20382	1398344	25	19478	1
1638826	7	20382	1958244	25	4408	1
1638826	31	20382	1193125	25	245227	1
1638833	7	20382	1969223	25	865	1
1639300	6	20382	1213900	25	100889	1
1639300	6	20382	1213900	25	100890	1
1639694	59	20382	1853620	25	258	1
1639695	4	20382	1639695	25	10	1
1640052	59	20382	1888524	25	17922	1
1642896	6	20382	1895101	25	6	1
1643219	21	20382	876661	25	798	1
1643303	3	20382	1104659	25	101312	1
1643303	3	20382	1104659	25	101313	1
1643573	6	20382	1643573	25	7	1
1644071	6	20382	1178253	25	7	1
1644419	22	20382	910472	25	2190	1
1644419	22	20382	910472	25	2196	1
1644419	22	20382	910472	25	2197	1
1644771	13	20382	1103646	25	6	1
1645384	59	20382	1888524	25	17869	1
1646736	59	20382	1888524	25	17897	1
1646972	9	20382	1646972	25	95	1
1648087	9	20382	1493152	25	18747	1
1648257	3	20382	1648257	25	73	1
1648403	20	20382	940400	25	4681	1
1648416	3	20382	1648416	25	104	1
1649363	65	20382	1213900	25	100665	1
1649989	13	20382	902664	25	4475	1
1650107	3	20382	1650107	25	154	1
1650558	29	20382	905148	25	3645	1
1650559	29	20382	905148	25	3648	1
1651311	66	20382	1193125	25	244299	1
1651311	44	20382	1193125	25	244292	1
1651790	59	20382	1888524	25	17867	1
1652149	6	20382	1652149	25	6	1
1652672	59	20382	1853620	25	259	1
1652997	29	20382	905148	25	3647	1
1653087	9	20382	1193125	25	245102	1
1653323	59	20382	1888524	25	17887	1
1653482	7	20382	1950047	25	8087	1
1654330	59	20382	1888524	25	17885	1
1655210	13	20382	1301396	25	12	1
1655589	55	20382	1655589	25	97	1
1655589	55	20382	1655589	25	98	1
1655589	21	20382	1143362	25	352	1
1656014	29	20382	919574	25	6201	1
1656109	6	20382	1193125	25	245267	1
1656313	6	20382	1008886	25	275	1
1657516	4	20382	1657516	25	8	1
1658484	6	20382	891103	25	167	1
1659718	4	20382	1659718	25	9	1
1660046	3	20382	1213900	25	100464	1
1660046	3	20382	1213900	25	100505	1
1660694	4	20382	1660694	25	7	1
1660999	6	20382	1193125	25	245135	1
1661245	4	20382	1661245	25	6	1
1661600	9	20382	1683168	25	7678	1
1661998	9	20382	1193125	25	244262	1
1662991	9	20382	1662991	25	253	1
1663239	59	20382	1888524	25	17875	1
1665518	4	20382	1665518	25	4	1
1665614	67	20382	1665614	25	4	1
1665650	1	20382	1213900	25	100449	1
1665650	1	20382	1213900	25	100455	1
1665650	1	20382	1213900	25	100470	1
1665650	1	20382	1213900	25	100479	1
1665650	1	20382	1213900	25	100565	1
1665650	1	20382	1213900	25	100567	1
1665650	1	20382	1213900	25	100634	1
1665650	1	20382	1213900	25	100657	1
1665650	1	20382	1213900	25	100660	1
1665650	1	20382	1213900	25	100683	1
1665650	1	20382	1213900	25	100686	1
1665650	1	20382	1213900	25	100687	1
1665650	1	20382	1213900	25	100695	1
1665650	1	20382	1213900	25	100696	1
1665650	1	20382	1213900	25	100704	1
1665650	1	20382	1213900	25	100705	1
1665650	1	20382	1213900	25	100707	1
1665650	1	20382	1213900	25	100712	1
1665650	1	20382	1213900	25	100715	1
1665650	1	20382	1213900	25	100718	1
1665650	1	20382	1213900	25	100722	1
1665650	1	20382	1213900	25	100723	1
1665650	1	20382	1213900	25	100725	1
1665650	1	20382	1213900	25	100726	1
1665650	1	20382	1213900	25	100727	1
1665650	1	20382	1213900	25	100729	1
1665650	1	20382	1213900	25	100731	1
1665650	1	20382	1213900	25	100733	1
1665650	1	20382	1213900	25	100736	1
1665650	1	20382	1213900	25	100738	1
1665650	1	20382	1213900	25	100740	1
1665650	1	20382	1213900	25	100744	1
1665650	1	20382	1213900	25	100750	1
1665650	1	20382	1213900	25	100752	1
1665650	1	20382	1213900	25	100754	1
1665650	1	20382	1213900	25	100755	1
1665650	1	20382	1213900	25	100757	1
1665650	1	20382	1213900	25	100760	1
1665650	1	20382	1213900	25	100763	1
1665650	1	20382	1213900	25	100766	1
1665650	1	20382	1213900	25	100768	1
1665650	1	20382	1213900	25	100769	1
1665650	1	20382	1213900	25	100774	1
1665650	1	20382	1213900	25	100776	1
1665650	1	20382	1213900	25	100777	1
1665650	1	20382	1213900	25	100780	1
1665650	1	20382	1213900	25	100782	1
1665650	1	20382	1213900	25	100784	1
1665650	1	20382	1213900	25	100787	1
1665650	1	20382	1213900	25	100793	1
1665650	1	20382	1213900	25	100825	1
1665650	1	20382	1213900	25	100828	1
1665650	1	20382	1213900	25	100834	1
1665650	1	20382	1213900	25	100837	1
1665650	1	20382	1213900	25	100838	1
1665650	1	20382	1213900	25	100840	1
1665650	1	20382	1213900	25	100842	1
1665650	1	20382	1213900	25	100844	1
1665650	1	20382	1213900	25	100845	1
1665650	1	20382	1213900	25	100850	1
1665650	1	20382	1213900	25	100851	1
1665650	1	20382	1213900	25	100853	1
1665650	1	20382	1213900	25	100856	1
1665650	1	20382	1213900	25	100857	1
1665650	1	20382	1213900	25	100862	1
1665650	1	20382	1213900	25	100866	1
1665650	1	20382	1213900	25	100867	1
1665650	1	20382	1213900	25	100871	1
1665650	1	20382	1213900	25	100878	1
1665650	1	20382	1213900	25	100892	1
1665650	1	20382	1213900	25	100893	1
1665650	1	20382	1213900	25	100903	1
1665650	1	20382	1839882	25	59410	1
1665650	1	20382	1839882	25	59430	1
1665650	1	20382	1839882	25	59513	1
1665650	1	20382	1839882	25	59535	1
1665650	1	20382	1839882	25	59566	1
1665650	1	20382	1839882	25	59568	1
1665650	1	20382	1839882	25	59596	1
1665650	1	20382	1839882	25	59609	1
1665650	1	20382	1839882	25	59628	1
1665650	1	20382	1839882	25	59629	1
1665650	1	20382	1839882	25	59630	1
1665650	1	20382	1839882	25	59632	1
1665650	1	20382	1839882	25	59642	1
1665650	1	20382	1839882	25	59646	1
1665650	1	20382	1839882	25	59648	1
1665650	1	20382	1839882	25	59650	1
1665650	1	20382	1839882	25	59651	1
1665650	1	20382	1839882	25	59653	1
1665650	1	20382	1839882	25	59655	1
1665650	1	20382	1839882	25	59661	1
1665650	1	20382	1839882	25	59663	1
1665650	1	20382	1839882	25	59666	1
1665650	1	20382	1839882	25	59667	1
1665650	1	20382	1839882	25	59670	1
1665650	1	20382	1839882	25	59671	1
1665650	1	20382	1839882	25	59673	1
1665650	1	20382	1839882	25	59695	1
1665650	23	20382	1213900	25	100450	1
1665650	23	20382	1213900	25	100451	1
1665650	2	20382	1213900	25	100458	1
1665650	2	20382	1213900	25	100694	1
1665731	8	20382	1665731	25	4	1
1665731	6	20382	1665731	25	6	1
1665925	4	20382	1665925	25	5	1
1666268	1	20382	1839882	25	59319	1
1666268	1	20382	1839882	25	59320	1
1666268	1	20382	1839882	25	59369	1
1666268	1	20382	1839882	25	59377	1
1666268	1	20382	1839882	25	59379	1
1666268	1	20382	1839882	25	59380	1
1666268	1	20382	1839882	25	59382	1
1666268	1	20382	1839882	25	59383	1
1666268	1	20382	1839882	25	59384	1
1666268	1	20382	1839882	25	59385	1
1666268	1	20382	1839882	25	59386	1
1666268	1	20382	1839882	25	59387	1
1666268	1	20382	1839882	25	59388	1
1666268	1	20382	1839882	25	59390	1
1666268	1	20382	1839882	25	59391	1
1666268	1	20382	1839882	25	59393	1
1666268	1	20382	1839882	25	59394	1
1666268	1	20382	1839882	25	59395	1
1666268	1	20382	1839882	25	59396	1
1666268	1	20382	1839882	25	59398	1
1666268	1	20382	1839882	25	59399	1
1666268	1	20382	1839882	25	59401	1
1666268	1	20382	1839882	25	59423	1
1666268	1	20382	1839882	25	59425	1
1666268	1	20382	1839882	25	59431	1
1666268	1	20382	1839882	25	59433	1
1666268	1	20382	1839882	25	59450	1
1666268	1	20382	1839882	25	59454	1
1666268	1	20382	1839882	25	59457	1
1666268	1	20382	1839882	25	59458	1
1666268	1	20382	1839882	25	59467	1
1666268	1	20382	1839882	25	59468	1
1666268	1	20382	1839882	25	59479	1
1666268	1	20382	1839882	25	59480	1
1666268	1	20382	1839882	25	59483	1
1666268	1	20382	1839882	25	59484	1
1666268	1	20382	1839882	25	59486	1
1666268	1	20382	1839882	25	59487	1
1666268	1	20382	1839882	25	59489	1
1666268	1	20382	1839882	25	59492	1
1666268	1	20382	1839882	25	59502	1
1666268	1	20382	1839882	25	59503	1
1666268	1	20382	1839882	25	59504	1
1666268	1	20382	1839882	25	59505	1
1666268	1	20382	1839882	25	59506	1
1666268	1	20382	1839882	25	59517	1
1666268	1	20382	1839882	25	59518	1
1666268	1	20382	1839882	25	59519	1
1666268	1	20382	1839882	25	59520	1
1666268	1	20382	1839882	25	59521	1
1666268	1	20382	1839882	25	59522	1
1666268	1	20382	1839882	25	59523	1
1666268	1	20382	1839882	25	59525	1
1666268	1	20382	1839882	25	59527	1
1666268	1	20382	1839882	25	59528	1
1666268	1	20382	1839882	25	59530	1
1666268	1	20382	1839882	25	59531	1
1666268	1	20382	1839882	25	59536	1
1666268	1	20382	1839882	25	59537	1
1666268	1	20382	1839882	25	59539	1
1666268	1	20382	1839882	25	59540	1
1666268	1	20382	1839882	25	59551	1
1666268	1	20382	1839882	25	59552	1
1666268	1	20382	1839882	25	59553	1
1666268	1	20382	1839882	25	59554	1
1666268	1	20382	1839882	25	59555	1
1666268	1	20382	1839882	25	59557	1
1666268	1	20382	1839882	25	59561	1
1666268	1	20382	1839882	25	59562	1
1666268	1	20382	1839882	25	59563	1
1666268	1	20382	1839882	25	59565	1
1666268	1	20382	1839882	25	59567	1
1666268	1	20382	1839882	25	59569	1
1666268	1	20382	1839882	25	59570	1
1666268	1	20382	1839882	25	59574	1
1666268	1	20382	1839882	25	59575	1
1666268	1	20382	1839882	25	59580	1
1666268	1	20382	1839882	25	59583	1
1666268	1	20382	1839882	25	59585	1
1666268	1	20382	1839882	25	59594	1
1666268	1	20382	1839882	25	59597	1
1666268	1	20382	1839882	25	59603	1
1666268	1	20382	1839882	25	59607	1
1666268	1	20382	1839882	25	59681	1
1666268	1	20382	1839882	25	59682	1
1666268	1	20382	1839882	25	59683	1
1666268	1	20382	1839882	25	59685	1
1666268	1	20382	1839882	25	59686	1
1666268	1	20382	1839882	25	59687	1
1666268	1	20382	1839882	25	59688	1
1666268	1	20382	1839882	25	59689	1
1666268	1	20382	1839882	25	59692	1
1666268	1	20382	1839882	25	59696	1
1666268	1	20382	1839882	25	59700	1
1666268	2	20382	1839882	25	59323	1
1666268	2	20382	1839882	25	59334	1
1666268	2	20382	1839882	25	59336	1
1666268	2	20382	1839882	25	59429	1
1666268	2	20382	1839882	25	59453	1
1666268	2	20382	1839882	25	59533	1
1666268	2	20382	1839882	25	59698	1
1666268	2	20382	1839882	25	59701	1
1667919	22	20382	940400	25	4755	1
1667919	22	20382	940400	25	4756	1
1667919	22	20382	940400	25	4757	1
1667919	22	20382	940400	25	4758	1
1667919	22	20382	940400	25	4759	1
1667919	22	20382	940400	25	4760	1
1667919	22	20382	940400	25	4761	1
1667919	22	20382	940400	25	4762	1
1667919	22	20382	940400	25	4763	1
1667919	22	20382	940400	25	4764	1
1667919	22	20382	940400	25	4765	1
1667919	22	20382	940400	25	4766	1
1667919	22	20382	940400	25	4767	1
1667919	22	20382	940400	25	4768	1
1667919	22	20382	940400	25	4769	1
1667919	22	20382	940400	25	4770	1
1667919	22	20382	940400	25	4771	1
1667919	22	20382	940400	25	4772	1
1667919	22	20382	940400	25	4773	1
1667919	22	20382	940400	25	4774	1
1667919	22	20382	940400	25	4775	1
1667919	22	20382	940400	25	4776	1
1667919	22	20382	940400	25	4777	1
1667919	22	20382	940400	25	4778	1
1667919	22	20382	940400	25	4779	1
1667919	22	20382	940400	25	4780	1
1667919	22	20382	940400	25	4781	1
1667919	22	20382	940400	25	4782	1
1667919	22	20382	940400	25	4783	1
1667919	22	20382	940400	25	4784	1
1667919	22	20382	940400	25	4785	1
1667919	22	20382	940400	25	4786	1
1667919	22	20382	940400	25	4787	1
1667919	22	20382	940400	25	4788	1
1667919	22	20382	940400	25	4789	1
1667919	22	20382	940400	25	4790	1
1667919	22	20382	940400	25	4791	1
1667919	22	20382	940400	25	4792	1
1667919	22	20382	940400	25	4793	1
1667919	22	20382	940400	25	4794	1
1667919	22	20382	940400	25	4795	1
1667919	22	20382	940400	25	4796	1
1667919	22	20382	940400	25	4797	1
1667919	22	20382	940400	25	4798	1
1667919	22	20382	940400	25	4799	1
1667919	22	20382	940400	25	4800	1
1667919	22	20382	940400	25	4801	1
1667919	22	20382	940400	25	4802	1
1667919	22	20382	940400	25	4803	1
1667919	22	20382	940400	25	4804	1
1667919	22	20382	940400	25	4805	1
1667919	22	20382	940400	25	4806	1
1667919	22	20382	940400	25	4807	1
1667919	22	20382	940400	25	4808	1
1667919	22	20382	940400	25	4809	1
1667919	22	20382	940400	25	4810	1
1667919	22	20382	940400	25	4811	1
1667919	22	20382	940400	25	4812	1
1667919	22	20382	940400	25	4813	1
1667919	22	20382	940400	25	4814	1
1667919	22	20382	940400	25	4815	1
1667919	22	20382	940400	25	4816	1
1667919	22	20382	940400	25	4817	1
1667919	22	20382	940400	25	4818	1
1667919	22	20382	940400	25	4819	1
1667919	22	20382	940400	25	4820	1
1667919	22	20382	940400	25	4821	1
1667919	22	20382	940400	25	4822	1
1667919	22	20382	940400	25	4823	1
1667919	22	20382	940400	25	4837	1
1667919	22	20382	940400	25	4838	1
1667919	22	20382	940400	25	4839	1
1667919	22	20382	940400	25	4842	1
1667919	22	20382	940400	25	4844	1
1667919	22	20382	940400	25	4845	1
1667919	22	20382	940400	25	4846	1
1667919	22	20382	940400	25	4847	1
1668393	47	20382	1193805	25	1483	1
1668738	59	20382	1888524	25	17924	1
1669626	5	20382	1193125	25	243855	1
1670946	40	20382	1628280	25	45597	1
1670982	6	20382	891103	25	173	1
1671502	9	20382	1104659	25	101269	1
1672619	6	20382	1967168	25	7	1
1673232	6	20382	1673232	25	8	1
1673772	24	20382	1193125	25	245097	1
1673991	6	20382	1193125	25	245411	1
1674020	63	20382	1674020	25	7	1
1674440	19	20382	2091629	25	7	1
1674510	6	20382	1674510	25	3	1
1675644	9	20382	1675644	25	141	1
1676047	41	20382	1213900	25	100709	1
1676163	9	20382	1213900	25	100541	1
1676283	8	20382	1423221	25	33	1
1676475	6	20382	1225208	25	8697	1
1677390	59	20382	1888524	25	17916	1
1677396	6	20382	1225208	25	8696	1
1679327	59	20382	1888524	25	17861	1
1679707	6	20382	1628280	25	45761	1
1680378	9	20382	1628280	25	45679	1
1680788	25	20382	1140361	25	38807	1
1680788	25	20382	1140361	25	38807	1
1682472	1	20382	1918704	25	17731	1
1682472	1	20382	1918704	25	17732	1
1682472	1	20382	1918704	25	17733	1
1682472	1	20382	1918704	25	17734	1
1682472	1	20382	1918704	25	17735	1
1682472	1	20382	1918704	25	17737	1
1682472	1	20382	1918704	25	17743	1
1682472	1	20382	1918704	25	17744	1
1682472	1	20382	1918704	25	17745	1
1682472	1	20382	1918704	25	17747	1
1682472	1	20382	1918704	25	17751	1
1682472	1	20382	1918704	25	17753	1
1682472	1	20382	1918704	25	17760	1
1682472	1	20382	1918704	25	17761	1
1682472	1	20382	1918704	25	17769	1
1682472	1	20382	1918704	25	17816	1
1682472	1	20382	1918704	25	17817	1
1682472	1	20382	1918704	25	17818	1
1682472	1	20382	1918704	25	17819	1
1682472	1	20382	1918704	25	17820	1
1682472	1	20382	1918704	25	17821	1
1682472	1	20382	1918704	25	17822	1
1682472	1	20382	1918704	25	17829	1
1682472	1	20382	1918704	25	17830	1
1682472	1	20382	1918704	25	17831	1
1682472	1	20382	1918704	25	17832	1
1682472	1	20382	1918704	25	17834	1
1682472	1	20382	1918704	25	17835	1
1682472	1	20382	1918704	25	17836	1
1682472	1	20382	1918704	25	17837	1
1682472	1	20382	1918704	25	17838	1
1682472	1	20382	1918704	25	17839	1
1682472	1	20382	1918704	25	17840	1
1682472	1	20382	1918704	25	17841	1
1682472	1	20382	1918704	25	17842	1
1682472	1	20382	1918704	25	17843	1
1682472	1	20382	1918704	25	17844	1
1682472	1	20382	1918704	25	17846	1
1682472	1	20382	1918704	25	17848	1
1682472	1	20382	1918704	25	17852	1
1682472	1	20382	1918704	25	17853	1
1682472	1	20382	1918704	25	17854	1
1682472	1	20382	1918704	25	17856	1
1682472	1	20382	1918704	25	17858	1
1682472	1	20382	1918704	25	17860	1
1682472	1	20382	1918704	25	17862	1
1682472	1	20382	1918704	25	17863	1
1682472	1	20382	1918704	25	17864	1
1682472	1	20382	1918704	25	17865	1
1682472	1	20382	1918704	25	17866	1
1682472	1	20382	1918704	25	17867	1
1682472	1	20382	1918704	25	17869	1
1682472	1	20382	1918704	25	17870	1
1682472	1	20382	1918704	25	17871	1
1682472	1	20382	1918704	25	17872	1
1682472	1	20382	1918704	25	17873	1
1682472	1	20382	1918704	25	17874	1
1682472	1	20382	1918704	25	17875	1
1682472	1	20382	1918704	25	17876	1
1682472	1	20382	1918704	25	17877	1
1682472	1	20382	1918704	25	17878	1
1682472	1	20382	1918704	25	17879	1
1682472	1	20382	1918704	25	17880	1
1682472	1	20382	1918704	25	17881	1
1682472	1	20382	1918704	25	17882	1
1682472	1	20382	1918704	25	17883	1
1682472	1	20382	1918704	25	17884	1
1682472	1	20382	1918704	25	17885	1
1682472	1	20382	1918704	25	17886	1
1682472	1	20382	1918704	25	17887	1
1682472	1	20382	1918704	25	17888	1
1682472	1	20382	1918704	25	17893	1
1682472	1	20382	1918704	25	17894	1
1682472	1	20382	1918704	25	17895	1
1682472	1	20382	1918704	25	17896	1
1682472	1	20382	1918704	25	17897	1
1682472	1	20382	1918704	25	17898	1
1682472	1	20382	1918704	25	17899	1
1682472	1	20382	1918704	25	17901	1
1682472	2	20382	1918704	25	17750	1
1682852	17	20382	1140361	25	38820	1
1683542	29	20382	1683542	25	3	1
1683695	68	20382	1140361	25	38818	1
1684185	6	20382	1137789	25	271	1
1685054	59	20382	1888524	25	17859	1
1685159	6	20382	1225208	25	8692	1
1685212	59	20382	1888524	25	17889	1
1687092	29	20382	905148	25	3642	1
1687451	3	20382	1185185	25	1498	1
1689346	29	20382	1689346	25	2	1
1689548	9	20382	1689548	25	103	1
1692038	4	20382	1692038	25	13	1
1692819	7	20382	1959173	25	6508	1
1692819	6	20382	1268406	25	31	1
1693577	9	20382	1437749	25	31387	1
1694079	4	20382	1398344	25	19464	1
1694592	4	20382	1694592	25	3	1
1695582	4	20382	1695582	25	3	1
1696867	4	20382	1696867	25	6	1
1696957	4	20382	1696957	25	8	1
1698750	4	20382	1698750	25	5	1
1699080	4	20382	1699080	25	7	1
1699737	38	20382	1699737	25	10	1
1701756	6	20382	1701756	25	191	1
1702123	3	20382	1062993	25	16232	1
1702745	59	20382	1888524	25	17872	1
1702745	46	20382	1888524	25	17873	1
1703807	6	20382	1550695	25	107	1
1704336	7	20382	1950047	25	8093	1
1704720	69	20382	1193125	25	245221	1
1705929	4	20382	1214659	25	15139	1
1706403	59	20382	1888524	25	17878	1
1706403	46	20382	1888524	25	17879	1
1706431	7	20382	1493152	25	18844	1
1707000	7	20382	1959173	25	6509	1
1707488	29	20382	1707488	25	3	1
1707502	6	20382	1193125	25	245090	1
1707712	6	20382	1193125	25	245449	1
1708263	29	20382	1708263	25	3	1
1708269	7	20382	1628280	25	45704	1
1708599	6	20382	1301120	25	9	1
1709628	9	20382	1683168	25	7696	1
1709682	6	20382	1213900	25	100830	1
1709682	19	20382	1213900	25	100831	1
1710175	6	20382	1193125	25	245141	1
1710477	4	20382	1710477	25	5	1
1713112	4	20382	1713112	25	4	1
1713337	6	20382	1225208	25	8687	1
1714154	59	20382	1888524	25	17851	1
1714154	46	20382	1888524	25	17852	1
1714562	18	20382	1493152	25	18729	1
1715925	3	20382	1193125	25	244406	1
1715925	3	20382	1193125	25	245060	1
1716654	6	20382	351834	25	9	1
1718227	6	20382	1193125	25	245449	1
1718227	6	20382	1628280	25	45699	1
1718227	6	20382	1628280	25	45700	1
1718227	6	20382	1628280	25	45701	1
1718227	6	20382	1628280	25	45702	1
1718227	6	20382	1628280	25	45703	1
1719388	29	20382	1719388	25	2	1
1719611	19	20382	1140361	25	38768	1
1719959	59	20382	1888524	25	17854	1
1719959	46	20382	1888524	25	17855	1
1720158	29	20382	1104659	25	100986	1
1720773	6	20382	1720773	25	5	1
1721695	28	20382	1104659	25	101332	1
1721984	6	20382	891103	25	172	1
1722556	12	20382	1722556	25	5	1
1723596	6	20382	1729859	25	7	1
1723596	6	20382	1729897	25	7	1
1723596	6	20382	1752640	25	7	1
1724009	9	20382	1193125	25	244604	1
1724729	4	20382	1724729	25	8	1
1725430	9	20382	1493152	25	18806	1
1725448	6	20382	1628280	25	45682	1
1725506	6	20382	891103	25	163	1
1725882	3	20382	1213900	25	100829	1
1725964	3	20382	1193125	25	244418	1
1726173	19	20382	807249	25	144	1
1727342	4	20382	1727342	25	10	1
1728328	6	20382	1213900	25	100720	1
1728657	4	20382	1398344	25	19410	1
1729214	3	20382	1171843	25	6532	1
1729214	3	20382	1171843	25	6546	1
1729214	3	20382	1171843	25	6552	1
1729359	4	20382	1729359	25	7	1
1729522	4	20382	1193125	25	245226	1
1729859	6	20382	1729859	25	7	1
1729897	6	20382	1729897	25	7	1
1730900	29	20382	1730900	25	3	1
1732194	7	20382	1950047	25	8089	1
1732406	9	20382	1193125	25	245100	1
1732409	9	20382	1193125	25	245112	1
1733547	6	20382	1193125	25	245563	1
1733547	6	20382	1193125	25	245564	1
1734722	6	20382	1855764	25	8	1
1734722	6	20382	1855767	25	25	1
1734726	6	20382	1193125	25	245564	1
1735438	7	20382	1742734	25	7	1
1735438	6	20382	1742734	25	8	1
1735733	59	20382	1888524	25	17883	1
1735733	46	20382	1888524	25	17884	1
1735964	8	20382	1213900	25	100759	1
1737287	7	20382	1491874	25	5	1
1737294	6	20382	1437749	25	31421	1
1737842	70	20382	1737842	25	2	1
1737892	6	20382	1737892	25	3	1
1738071	13	20382	1738071	25	10	1
1738074	55	20382	1193125	25	245075	1
1738074	55	20382	1193125	25	245076	1
1738074	5	20382	1193125	25	245066	1
1738074	5	20382	1193125	25	245068	1
1738074	5	20382	1193125	25	245069	1
1738460	6	20382	109380	25	126	1
1738723	4	20382	1738723	25	5	1
1739104	6	20382	1479079	25	8	1
1739104	6	20382	1916473	25	8	1
1739258	6	20382	1628280	25	45701	1
1739441	6	20382	1213900	25	100920	1
1740063	4	20382	1740063	25	6	1
1741079	6	20382	1225208	25	8695	1
1741720	6	20382	1741720	25	4	1
1742341	13	20382	1213900	25	100714	1
1742341	13	20382	1213900	25	100942	1
1742734	7	20382	1742734	25	7	1
1742734	6	20382	1742734	25	8	1
1744269	6	20382	1193125	25	245142	1
1745853	6	20382	1185185	25	1504	1
1745916	9	20382	1104659	25	101260	1
1746109	9	20382	1104659	25	101224	1
1746109	9	20382	1104659	25	101226	1
1746376	6	20382	902664	25	4499	1
1746438	4	20382	2063364	25	248	1
1746470	40	20382	1493152	25	18764	1
1746470	6	20382	1493152	25	18740	1
1746967	6	20382	1398344	25	19502	1
1748425	35	20382	1999371	25	15766	1
1748425	35	20382	1999371	25	15766	1
1748425	55	20382	1999371	25	15769	1
1748425	56	20382	1999371	25	15767	1
1748566	6	20382	1701756	25	191	1
1749744	4	20382	1580642	25	6659	1
1750155	9	20382	1750155	25	71	1
1751783	9	20382	1751783	25	47	1
1752640	6	20382	1752640	25	7	1
1754218	29	20382	906791	25	18	1
1754816	29	20382	1754816	25	2	1
1756131	29	20382	1756131	25	3	1
1756543	4	20382	1756543	25	9	1
1756594	38	20382	1699737	25	10	1
1756959	4	20382	1756959	25	4	1
1757499	9	20382	1493152	25	18788	1
1758045	70	20382	1758045	25	5	1
1758232	8	20382	1213900	25	100810	1
1758232	6	20382	1213900	25	100922	1
1759495	70	20382	1759495	25	3	1
1760903	8	20382	2091918	25	1	1
1761312	7	20382	1950047	25	8094	1
1761325	9	20382	1193125	25	245113	1
1761609	6	20382	1628280	25	45703	1
1761857	6	20382	1213900	25	100720	1
1761911	71	20382	1104659	25	100941	1
1763501	59	20382	1888524	25	17839	1
1763501	46	20382	1888524	25	17840	1
1765768	4	20382	945621	25	978	1
1766156	4	20382	1766156	25	8	1
1767617	4	20382	1767617	25	6	1
1768744	4	20382	1768744	25	14	1
1768744	4	20382	1768744	25	15	1
1768744	4	20382	1768744	25	16	1
1768928	53	20382	1768928	25	10	1
1769697	3	20382	1062993	25	16234	1
1769759	72	20382	1104659	25	101101	1
1772383	7	20382	1950047	25	8094	1
1773812	6	20382	1213900	25	100889	1
1775111	29	20382	1775111	25	3	1
1775130	29	20382	1775130	25	3	1
1775734	9	20382	1493152	25	18825	1
1776111	6	20382	1193125	25	245411	1
1776353	19	20382	921895	25	2780	1
1776521	29	20382	1776521	25	3	1
1776551	4	20382	1776551	25	3	1
1776704	6	20382	1412408	25	92	1
1776729	6	20382	1412408	25	94	1
1776732	6	20382	1412408	25	96	1
1776863	6	20382	1412408	25	90	1
1776985	73	20382	1193125	25	245092	1
1776985	44	20382	1193125	25	245191	1
1777319	9	20382	1493152	25	18827	1
1777319	62	20382	1493152	25	18808	1
1777921	40	20382	1437749	25	31450	1
1777921	6	20382	1437749	25	31451	1
1780312	24	20382	1493152	25	18805	1
1780312	6	20382	1493152	25	18843	1
1780312	9	20382	1493152	25	18802	1
1780525	7	20382	1921094	25	1283	1
1781174	6	20382	905148	25	3637	1
1781319	6	20382	1781319	25	4	1
1782338	7	20382	1493152	25	18844	1
1783312	6	20382	351834	25	11	1
1783879	7	20382	1950047	25	8091	1
1783977	29	20382	1783977	25	3	1
1784996	6	20382	1784996	25	28	1
1786352	8	20382	921895	25	2785	1
1786352	8	20382	1665731	25	4	1
1786352	6	20382	921895	25	2786	1
1786352	6	20382	1665731	25	6	1
1786629	29	20382	1786629	25	3	1
1786909	3	20382	1205613	25	50	1
1787336	70	20382	1787336	25	4	1
1788029	29	20382	1636587	25	55	1
1788393	8	20382	1193125	25	245098	1
1788393	6	20382	1193125	25	245106	1
1788399	8	20382	2091286	25	1	1
1789656	6	20382	1213900	25	100890	1
1789972	6	20382	902664	25	4499	1
1790340	28	20382	902664	25	4478	1
1790723	4	20382	1790723	25	7	1
1791555	4	20382	1062993	25	16238	1
1792171	29	20382	1792171	25	3	1
1793691	4	20382	1793691	25	8	1
1794034	19	20382	1214659	25	15160	1
1794194	6	20382	1550695	25	105	1
1794486	6	20382	1193125	25	245088	1
1795091	9	20382	1213900	25	100821	1
1795250	6	20382	1193125	25	245088	1
1797322	29	20382	1797322	25	3	1
1799207	3	20382	950103	25	13415	1
1801170	6	20382	1839066	25	19	1
1801170	6	20382	1938197	25	13	1
1801732	7	20382	1921094	25	1282	1
1801792	4	20382	1801792	25	5	1
1801868	4	20382	1801868	25	3	1
1801926	4	20382	1801926	25	2	1
1802290	4	20382	1725547	25	4184	1
1802516	4	20382	1172661	25	4348	1
1803227	4	20382	1725547	25	4185	1
1803407	3	20382	1213900	25	100708	1
1803498	6	20382	1213900	25	100920	1
1803498	9	20382	1803498	25	73	1
1803696	6	20382	1193125	25	245096	1
1803696	6	20382	1193125	25	245109	1
1803696	6	20382	1193125	25	245119	1
1804116	4	20382	1804116	25	4	1
1804745	9	20382	1804745	25	83	1
1805284	28	20382	902664	25	4494	1
1805526	28	20382	1104659	25	101330	1
1805602	6	20382	1225208	25	8699	1
1806484	29	20382	1806484	25	3	1
1806837	9	20382	1104659	25	101040	1
1807136	6	20382	1807136	25	3	1
1807887	62	20382	1493152	25	18753	1
1807896	38	20382	943374	25	442	1
1808323	6	20382	1531152	25	122	1
1809122	66	20382	1104659	25	101286	1
1809122	44	20382	1193125	25	245191	1
1810089	4	20382	1810089	25	6	1
1811074	6	20382	1437749	25	31412	1
1811806	4	20382	1811806	25	7	1
1811907	4	20382	1811907	25	5	1
1813744	9	20382	1813744	25	17	1
1815953	6	20382	891103	25	169	1
1816172	28	20382	902664	25	4476	1
1816708	24	20382	1628280	25	45737	1
1816736	24	20382	1193125	25	245368	1
1816738	6	20382	891103	25	170	1
1816970	6	20382	1409970	25	67	1
1817229	6	20382	2050755	25	19	1
1819704	3	20382	1104659	25	101302	1
1820144	6	20382	1937262	25	11	1
1820302	9	20382	1628280	25	45560	1
1822359	74	20382	1213900	25	100516	1
1822523	18	20382	1829126	25	8315	1
1823099	7	20382	1950047	25	8092	1
1823138	16	20382	902664	25	4496	1
1823466	6	20382	1193125	25	245560	1
1823466	6	20382	1193125	25	245562	1
1823466	6	20382	1193125	25	245567	1
1823466	6	20382	1193125	25	245568	1
1823466	6	20382	1193125	25	245570	1
1823543	6	20382	1823543	25	4	1
1823608	9	20382	1823608	25	103	1
1825461	29	20382	1825461	25	3	1
1825462	29	20382	1825462	25	3	1
1825538	29	20382	1825538	25	3	1
1825539	29	20382	1825539	25	4	1
1825615	8	20382	929638	25	3964	1
1825615	6	20382	929638	25	3965	1
1827821	9	20382	1827821	25	10	1
1827899	12	20382	1213900	25	100501	1
1828536	6	20382	1977206	25	6	1
1828805	6	20382	1213900	25	100863	1
1828813	6	20382	1628280	25	45696	1
1828937	9	20382	1193125	25	245228	1
1830072	9	20382	1683168	25	7681	1
1830195	7	20382	1950047	25	8096	1
1830214	7	20382	1959173	25	6512	1
1830214	7	20382	1959173	25	6514	1
1830214	6	20382	1977441	25	10	1
1831979	9	20382	1493152	25	18735	1
1832332	75	20382	1193125	25	245170	1
1832332	9	20382	1193125	25	245131	1
1834494	9	20382	1140361	25	38822	1
18349	6	20382	1571561	25	3	1
1835856	28	20382	902664	25	4486	1
1835994	29	20382	1835994	25	2	1
1837493	3	20382	1213900	25	100779	1
1837671	6	20382	1193125	25	245534	1
1838369	29	20382	1838369	25	3	1
1838987	9	20382	1213900	25	100571	1
1839066	6	20382	1839066	25	19	1
1839341	16	20382	902664	25	4496	1
1839347	70	20382	1839347	25	3	1
1839545	4	20382	1839545	25	7	1
1840084	4	20382	1840084	25	15	1
1840563	9	20382	1213900	25	100797	1
1840776	7	20382	1628280	25	45709	1
1840776	6	20382	1628280	25	45726	1
1840904	9	20382	1140361	25	38748	1
1841088	6	20382	905148	25	3637	1
1841125	9	20382	1841125	25	145	1
1841675	3	20382	1104659	25	100992	1
1842572	4	20382	1842572	25	13	1
1842630	29	20382	1842630	25	3	1
1842754	8	20382	1213900	25	100762	1
1843294	4	20382	1843294	25	4	1
1843581	4	20382	1843581	25	7	1
1843582	53	20382	1843582	25	6	1
1843586	3	20382	1193125	25	244265	1
1844147	4	20382	1844147	25	5	1
1844392	13	20382	1214659	25	15166	1
1844964	59	20382	1193125	25	244231	1
1845003	4	20382	1845003	25	6	1
1845149	76	20382	1213900	25	100839	1
1845661	6	20382	1845661	25	3	1
1845930	4	20382	1062993	25	16242	1
1846177	4	20382	1846177	25	4	1
1846654	6	20382	1846654	25	4	1
1847409	3	20382	1279569	25	1132	1
1847794	4	20382	1847794	25	3	1
1847986	9	20382	1493152	25	18720	1
1848758	22	20382	894189	25	11602	1
1848758	22	20382	894189	25	11603	1
1849444	4	20382	1376474	25	852	1
1850270	57	20382	1140361	25	38845	1
1851535	77	20382	1213900	25	100907	1
1852338	4	20382	1852338	25	7	1
1853138	9	20382	1193125	25	245200	1
1853145	7	20382	1959173	25	6518	1
1853904	6	20382	1380106	25	190	1
1854368	3	20382	1213900	25	100538	1
1854640	3	20382	1104659	25	101266	1
1854640	3	20382	1171843	25	6568	1
1854795	9	20382	1213900	25	100804	1
1854908	6	20382	1137789	25	275	1
1854963	42	20382	1493152	25	18701	1
1855467	24	20382	1493152	25	18797	1
1855467	9	20382	1493152	25	18784	1
1855764	6	20382	1855764	25	8	1
1855767	6	20382	1855767	25	25	1
1856031	6	20382	1193125	25	245134	1
1856031	6	20382	1193125	25	245135	1
1856031	6	20382	1193125	25	245136	1
1856031	6	20382	1193125	25	245137	1
1856031	6	20382	1193125	25	245138	1
1856031	6	20382	1193125	25	245139	1
1856031	6	20382	1193125	25	245140	1
1856031	6	20382	1193125	25	245141	1
1856031	6	20382	1193125	25	245142	1
1856031	6	20382	1193125	25	245143	1
1856610	6	20382	1008886	25	277	1
1856906	7	20382	1959173	25	6518	1
1859392	9	20382	1859392	25	73	1
1859442	6	20382	1859442	25	4	1
1859690	3	20382	1104659	25	101054	1
1859807	9	20382	1213900	25	100443	1
1859807	9	20382	1213900	25	100494	1
1859918	4	20382	1859918	25	3	1
1859919	65	20382	1859919	25	82	1
1860257	53	20382	1860257	25	3	1
1860424	9	20382	1193125	25	245163	1
1860424	65	20382	1193125	25	245173	1
1860514	9	20382	1829126	25	8271	1
1860805	3	20382	1193125	25	243967	1
1861699	6	20382	1628280	25	45702	1
1862935	23	20382	1493152	25	18814	1
1862965	4	20382	1862965	25	10	1
1863894	4	20382	1863894	25	5	1
1864030	7	20382	1959173	25	6515	1
1864609	8	20382	1213900	25	100756	1
1865363	6	20382	1193125	25	245564	1
1865425	6	20382	1193125	25	245564	1
1865596	40	20382	1437749	25	31450	1
1865596	6	20382	1437749	25	31451	1
1865782	78	20382	1193125	25	245094	1
1867729	3	20382	1104659	25	101037	1
1867729	3	20382	1104659	25	101039	1
1869511	8	20382	1094891	25	81	1
1869972	6	20382	1869972	25	4	1
1871321	3	20382	1213900	25	100543	1
1871678	70	20382	1871678	25	2	1
1872254	4	20382	2085853	25	124	1
1872955	6	20382	1872955	25	15	1
1873275	29	20382	1873275	25	2	1
1873454	31	20382	1731122	25	1411	1
1874097	13	20382	902664	25	4477	1
1874315	79	20382	1437749	25	31430	1
1874315	32	20382	1437749	25	31429	1
1874818	6	20382	351834	25	13	1
1876431	80	20382	1876431	25	16	1
1876588	36	20382	1354457	25	1045	1
1877939	9	20382	1877939	25	108	1
1878122	46	20382	1193125	25	244341	1
1879016	24	20382	1104659	25	101310	1
1879016	9	20382	1104659	25	101292	1
1879373	50	20322	1213900	25	79580	1
1879373	42	20382	1213900	25	100833	1
1879754	23	20382	1185185	25	1512	1
1879754	31	20382	1185185	25	1511	1
1880224	6	20382	1193125	25	245139	1
1880279	6	20382	1193125	25	245140	1
1880290	6	20382	1193125	25	245136	1
1880368	6	20382	1193125	25	245143	1
1880431	40	20382	1493152	25	18764	1
1880431	6	20382	1493152	25	18740	1
1882215	29	20382	1882215	25	2	1
1882879	22	20382	940400	25	4967	1
1882879	22	20382	940400	25	4970	1
1882961	46	20382	1882961	25	34	1
1883788	9	20382	1493152	25	18811	1
1884021	51	20382	1213900	25	100868	1
1884021	51	20382	1213900	25	100868	1
1884021	51	20382	1213900	25	100869	1
1884021	51	20382	1213900	25	100869	1
1884021	51	20382	1213900	25	100872	1
1884021	51	20382	1213900	25	100872	1
1884021	51	20382	1213900	25	100874	1
1884021	51	20382	1213900	25	100874	1
1884021	51	20382	1213900	25	100875	1
1884021	51	20382	1213900	25	100875	1
1884021	51	20382	1213900	25	100880	1
1884021	51	20382	1213900	25	100880	1
1884021	51	20382	1213900	25	100881	1
1884021	51	20382	1213900	25	100881	1
1884021	51	20382	1213900	25	100883	1
1884021	51	20382	1213900	25	100883	1
1884021	51	20382	1213900	25	100886	1
1884021	51	20382	1213900	25	100886	1
1885319	4	20382	1754960	25	696	1
1885327	7	20382	1628280	25	45708	1
1885915	8	20382	1193125	25	245268	1
1886694	6	20382	912593	25	252	1
1886813	4	20382	1754960	25	701	1
1891435	6	20382	1193125	25	245137	1
1892500	3	20382	1213900	25	100535	1
1894292	29	20382	1894292	25	2	1
1894302	4	20382	1894302	25	7	1
1894525	6	20382	1573840	25	2	1
1894954	8	20382	1903596	25	494	1
1894954	8	20382	1903596	25	496	1
1894954	40	20382	1903596	25	498	1
1894954	6	20382	1903596	25	495	1
1894954	6	20382	1903596	25	497	1
1895101	6	20382	1895101	25	6	1
1895678	4	20382	1895678	25	6	1
1896310	46	20382	1896310	25	36	1
1897087	13	20382	1738071	25	10	1
1898496	9	20382	1213900	25	100912	1
1898604	6	20382	1193805	25	1494	1
1899030	4	20382	1193125	25	245278	1
1899671	6	20382	891103	25	168	1
1899753	4	20382	1899753	25	2	1
1900584	4	20382	1900584	25	7	1
1900656	59	20382	1900656	25	48	1
1900679	12	20382	1493152	25	18744	1
1901215	19	20382	1213900	25	100809	1
1901337	4	20382	1901337	25	2	1
1903508	62	20382	1628280	25	45728	1
1904033	4	20382	1904033	25	6	1
1905374	19	20382	950142	25	2841	1
1906375	6	20382	1137789	25	268	1
1907094	6	20382	1185185	25	1508	1
1907320	4	20382	1104659	25	101147	1
1907666	4	20382	1907666	25	3	1
1907830	6	20382	1628280	25	45684	1
1907898	4	20382	1907898	25	3	1
1908623	4	20382	1908623	25	6	1
1908705	81	20382	1213900	25	100480	1
1909327	6	20382	1909327	25	15	1
1909739	4	20382	1420506	25	2885	1
1909851	4	20382	1909851	25	7	1
1910381	4	20382	1910381	25	3	1
1910456	6	20382	902664	25	4499	1
1911000	4	20382	1911000	25	8	1
1911220	6	20382	1628280	25	45762	1
1911702	4	20382	1911702	25	2	1
1912161	6	20382	6955	25	47	1
1912273	82	20382	1193125	25	244217	1
1912273	19	20382	1193125	25	244202	1
1912920	6	20382	1225208	25	8704	1
1912954	12	20382	1912954	25	5	1
1913577	42	20382	1193125	25	245178	1
1913608	4	20382	1398344	25	19434	1
1913842	4	20382	1913842	25	8	1
1915687	4	20382	1915687	25	2	1
1916099	9	20382	1193125	25	245246	1
1916232	46	20382	1916232	25	35	1
1916366	4	20382	1754960	25	700	1
1916473	6	20382	1916473	25	8	1
1917764	6	20382	1225208	25	8705	1
1918043	70	20382	1062993	25	16227	1
1918080	8	20382	1213900	25	100803	1
1918080	6	20382	1213900	25	100808	1
1918080	9	20382	1213900	25	100860	1
1918712	23	20382	1918712	25	88	1
1918712	9	20382	1918712	25	87	1
1920453	9	20382	1193125	25	244606	1
1921260	6	20382	1104659	25	101177	1
1922641	3	20382	1178913	25	3528	1
1922963	4	20382	1754960	25	694	1
1923891	28	20382	1104659	25	101332	1
1924868	54	20382	1999371	25	15730	1
1924868	55	20382	1999371	25	15725	1
1925281	70	20382	1925281	25	4	1
1925853	4	20382	2085853	25	122	1
1926037	4	20382	1926037	25	6	1
1927507	83	20382	1927507	25	4	1
1927571	6	20382	1628280	25	45653	1
1929783	3	20382	1213900	25	100814	1
1929783	3	20382	1213900	25	100815	1
1930679	9	20382	1104659	25	101162	1
1930679	9	20382	1104659	25	101272	1
1931720	84	20382	19745	25	43	1
1931934	59	20382	1931934	25	45	1
1932377	46	20382	1932377	25	34	1
1933059	4	20382	1933059	25	2	1
1933138	29	20382	1933138	25	2	1
1933352	70	20382	1933352	25	2	1
1935210	6	20382	1193805	25	1494	1
1936611	19	20382	1213900	25	100809	1
1937262	6	20382	1937262	25	11	1
1937441	3	20382	2070979	25	44	1
1937669	6	20382	1193125	25	245567	1
1937737	3	20382	1213900	25	100901	1
1937749	6	20382	1193125	25	245570	1
1937751	6	20382	1193125	25	245568	1
1938197	6	20382	1938197	25	13	1
1938649	85	20382	1398344	25	19393	1
1939365	9	20382	1213900	25	100820	1
1939429	6	20382	1193125	25	245560	1
1939432	6	20382	1193125	25	245562	1
1939831	4	20382	1939831	25	5	1
1940095	6	20382	935703	25	87	1
1940674	3	20382	1493152	25	18742	1
1941506	7	20382	2082505	25	1	1
1942346	29	20382	1942346	25	4	1
1942464	6	20382	1193125	25	245096	1
1942496	6	20382	1193125	25	245119	1
1942499	6	20382	1193125	25	245109	1
1944019	46	20382	1944019	25	35	1
1944044	29	20382	1944044	25	2	1
1944285	22	20382	894189	25	11577	1
1944285	22	20382	894189	25	11578	1
1944285	22	20382	894189	25	11579	1
1944285	22	20382	894189	25	11580	1
1944285	22	20382	894189	25	11581	1
1944285	22	20382	894189	25	11582	1
1944397	7	20382	1950047	25	8090	1
1944399	3	20382	1213900	25	100906	1
1944485	59	20382	1944485	25	44	1
1944885	3	20382	1193125	25	244493	1
1945422	9	20382	1213900	25	100913	1
1946313	29	20382	905148	25	3641	1
1946398	29	20382	905148	25	3643	1
1946901	4	20382	1193125	25	244543	1
1947086	6	20382	1193125	25	245262	1
1948056	9	20382	1948056	25	61	1
1948357	29	20382	1948357	25	14	1
1950022	6	20382	1950022	25	4	1
1950226	29	20382	905148	25	3639	1
1950875	6	20382	1214659	25	15175	1
1950962	4	20382	1950962	25	11	1
1951089	19	20382	1213900	25	100558	1
1951118	46	20382	1193125	25	244370	1
1951593	29	20382	1951593	25	2	1
1951752	59	20382	1951752	25	44	1
1951891	29	20382	1405086	25	282	1
1953331	29	20382	1953331	25	3	1
1953926	86	20382	1104659	25	101271	1
1954429	6	20382	1628280	25	45766	1
1954480	4	20382	1954480	25	3	1
1954661	28	20382	919574	25	6209	1
1954694	58	20382	1493152	25	18738	1
1955705	6	20382	1193125	25	245564	1
1955706	6	20382	1193125	25	245564	1
1956471	4	20382	1956471	25	7	1
1956649	4	20382	1956649	25	6	1
1957124	4	20382	1957124	25	7	1
1957325	70	20382	1957325	25	3	1
1957369	7	20382	1959173	25	6511	1
1957424	46	20382	1193125	25	244371	1
1957521	29	20382	1957521	25	6	1
1957685	46	20382	1957685	25	35	1
1957840	4	20382	1957840	25	2	1
1957845	9	20382	1957845	25	77	1
1958252	70	20382	1231919	25	336	1
1958491	4	20382	1754960	25	695	1
1959023	87	20382	1213900	25	100539	1
1959548	29	20382	1959548	25	2	1
1960212	4	20382	1960212	25	3	1
1961629	59	20382	1888524	25	17894	1
1961629	46	20382	1888524	25	17895	1
19617	1	20382	1213900	25	100449	1
19617	1	20382	1213900	25	100455	1
19617	1	20382	1213900	25	100470	1
19617	1	20382	1213900	25	100479	1
19617	1	20382	1213900	25	100565	1
19617	1	20382	1213900	25	100567	1
19617	1	20382	1213900	25	100634	1
19617	1	20382	1213900	25	100657	1
19617	1	20382	1213900	25	100660	1
19617	1	20382	1213900	25	100683	1
19617	1	20382	1213900	25	100686	1
19617	1	20382	1213900	25	100687	1
19617	1	20382	1213900	25	100695	1
19617	1	20382	1213900	25	100696	1
19617	1	20382	1213900	25	100704	1
19617	1	20382	1213900	25	100705	1
19617	1	20382	1213900	25	100707	1
19617	1	20382	1213900	25	100712	1
19617	1	20382	1213900	25	100715	1
19617	1	20382	1213900	25	100718	1
19617	1	20382	1213900	25	100722	1
19617	1	20382	1213900	25	100723	1
19617	1	20382	1213900	25	100725	1
19617	1	20382	1213900	25	100726	1
19617	1	20382	1213900	25	100727	1
19617	1	20382	1213900	25	100729	1
19617	1	20382	1213900	25	100731	1
19617	1	20382	1213900	25	100733	1
19617	1	20382	1213900	25	100736	1
19617	1	20382	1213900	25	100738	1
19617	1	20382	1213900	25	100740	1
19617	1	20382	1213900	25	100744	1
19617	1	20382	1213900	25	100750	1
19617	1	20382	1213900	25	100752	1
19617	1	20382	1213900	25	100754	1
19617	1	20382	1213900	25	100755	1
19617	1	20382	1213900	25	100757	1
19617	1	20382	1213900	25	100760	1
19617	1	20382	1213900	25	100763	1
19617	1	20382	1213900	25	100766	1
19617	1	20382	1213900	25	100768	1
19617	1	20382	1213900	25	100769	1
19617	1	20382	1213900	25	100774	1
19617	1	20382	1213900	25	100776	1
19617	1	20382	1213900	25	100777	1
19617	1	20382	1213900	25	100780	1
19617	1	20382	1213900	25	100782	1
19617	1	20382	1213900	25	100784	1
19617	1	20382	1213900	25	100787	1
19617	1	20382	1213900	25	100793	1
19617	1	20382	1213900	25	100825	1
19617	1	20382	1213900	25	100828	1
19617	1	20382	1213900	25	100834	1
19617	1	20382	1213900	25	100837	1
19617	1	20382	1213900	25	100838	1
19617	1	20382	1213900	25	100840	1
19617	1	20382	1213900	25	100842	1
19617	1	20382	1213900	25	100844	1
19617	1	20382	1213900	25	100845	1
19617	1	20382	1213900	25	100850	1
19617	1	20382	1213900	25	100851	1
19617	1	20382	1213900	25	100853	1
19617	1	20382	1213900	25	100856	1
19617	1	20382	1213900	25	100857	1
19617	1	20382	1213900	25	100862	1
19617	1	20382	1213900	25	100866	1
19617	1	20382	1213900	25	100867	1
19617	1	20382	1213900	25	100871	1
19617	1	20382	1213900	25	100878	1
19617	1	20382	1213900	25	100892	1
19617	1	20382	1213900	25	100893	1
19617	1	20382	1213900	25	100903	1
19617	1	20382	1839882	25	59410	1
19617	1	20382	1839882	25	59430	1
19617	1	20382	1839882	25	59513	1
19617	1	20382	1839882	25	59535	1
19617	1	20382	1839882	25	59566	1
19617	1	20382	1839882	25	59568	1
19617	1	20382	1839882	25	59596	1
19617	1	20382	1839882	25	59609	1
19617	1	20382	1839882	25	59628	1
19617	1	20382	1839882	25	59629	1
19617	1	20382	1839882	25	59630	1
19617	1	20382	1839882	25	59632	1
19617	1	20382	1839882	25	59642	1
19617	1	20382	1839882	25	59646	1
19617	1	20382	1839882	25	59648	1
19617	1	20382	1839882	25	59650	1
19617	1	20382	1839882	25	59651	1
19617	1	20382	1839882	25	59653	1
19617	1	20382	1839882	25	59655	1
19617	1	20382	1839882	25	59661	1
19617	1	20382	1839882	25	59663	1
19617	1	20382	1839882	25	59666	1
19617	1	20382	1839882	25	59667	1
19617	1	20382	1839882	25	59670	1
19617	1	20382	1839882	25	59671	1
19617	1	20382	1839882	25	59673	1
19617	1	20382	1839882	25	59695	1
19617	23	20382	1213900	25	100450	1
19617	23	20382	1213900	25	100451	1
19617	2	20382	1213900	25	100457	1
19617	2	20382	1213900	25	100693	1
1961850	4	20382	1961850	25	7	1
1962481	9	20382	1493152	25	18789	1
1962838	4	20382	2085853	25	121	1
1963001	29	20382	1963001	25	3	1
1963807	4	20382	1172661	25	4337	1
1963967	4	20382	1963967	25	9	1
1964389	4	20382	1964389	25	6	1
1964738	9	20382	1628280	25	45731	1
1964741	6	20382	1964741	25	3	1
1965119	6	20382	1225208	25	8708	1
1965234	29	20382	1965234	25	2	1
1965271	4	20382	1965271	25	4	1
1965756	4	20382	1172661	25	4339	1
1965814	4	20382	1965814	25	9	1
1966011	4	20382	1966011	25	2	1
1966033	4	20382	1966033	25	8	1
1966210	4	20382	1966210	25	3	1
1966394	9	20382	1193125	25	245372	1
1966647	7	20382	1950047	25	8091	1
1967111	59	20382	1967111	25	44	1
1967168	6	20382	1967168	25	7	1
1968204	46	20382	1968204	25	34	1
1968915	9	20382	1968915	25	59	1
1969180	6	20382	1999826	25	2	1
1970509	88	20382	1104659	25	101289	1
1970509	9	20382	1104659	25	101287	1
1970527	6	20382	1412408	25	100	1
1970544	3	20382	1213900	25	100524	1
1970701	4	20382	2085853	25	120	1
1970751	21	20382	1143362	25	351	1
1971222	7	20382	1950047	25	8088	1
1971267	6	20382	351834	25	15	1
1972492	6	20382	1972492	25	3	1
1974300	46	20382	1193125	25	244344	1
19745	84	20382	19745	25	43	1
1974775	6	20382	2064835	25	18	1
1975499	6	20382	1975499	25	3	1
1975605	29	20382	1975605	25	3	1
1975736	9	20382	1104659	25	101279	1
1976065	4	20382	1420506	25	2883	1
1976517	35	20382	1398344	25	19480	1
1976517	35	20382	1398344	25	19480	1
1976517	35	20382	1398344	25	19484	1
1976517	35	20382	1398344	25	19484	1
1976517	55	20382	1398344	25	19441	1
1976517	55	20382	1398344	25	19443	1
1976517	55	20382	1398344	25	19445	1
1976517	55	20382	1398344	25	19447	1
1976517	55	20382	1398344	25	19486	1
1976517	55	20382	1398344	25	19488	1
1976517	56	20382	1398344	25	19439	1
1976517	56	20382	1398344	25	19485	1
1976672	15	20382	1976672	25	19	1
1976672	15	20382	1976672	25	19	1
1976990	6	20382	1550695	25	103	1
1977206	6	20382	1977206	25	6	1
1977224	59	20382	1977224	25	44	1
1977441	7	20382	1959173	25	6512	1
1977441	7	20382	1959173	25	6514	1
1977441	6	20382	1977441	25	10	1
1978199	38	20382	1731122	25	1421	1
1979069	46	20382	1979069	25	35	1
1979207	70	20382	1979207	25	2	1
1979396	70	20382	1979396	25	2	1
1979416	70	20382	1979416	25	2	1
1979477	29	20382	1979477	25	3	1
1981535	9	20382	1493152	25	18731	1
1981748	8	20382	1094891	25	69	1
1981781	8	20382	1094891	25	71	1
1982245	8	20382	1094891	25	77	1
1982701	9	20382	1193125	25	245230	1
1984060	9	20382	1193125	25	244603	1
1984180	89	20382	1984180	25	15	1
1984529	6	20382	1225208	25	8693	1
1985273	90	20382	1213900	25	100511	1
1986196	4	20382	1986196	25	6	1
1987248	6	20382	1628280	25	45759	1
1987592	6	20382	1628280	25	45700	1
1990080	4	20382	1990080	25	6	1
1990354	6	20382	1998250	25	11	1
1991085	59	20382	1991085	25	47	1
1991088	46	20382	1991088	25	34	1
1992816	70	20382	1992816	25	2	1
1992972	4	20382	1992972	25	7	1
1993004	88	20382	1993004	25	176	1
1993147	6	20382	1993147	25	6	1
1993977	46	20382	1193125	25	244367	1
1994899	29	20382	1994899	25	2	1
1995568	22	20382	940400	25	5004	1
1995773	4	20382	1995773	25	5	1
1996052	29	20382	1996052	25	2	1
1996154	4	20382	1996154	25	14	1
1996239	29	20382	1996239	25	2	1
1996605	29	20382	1996605	25	2	1
1996846	4	20382	1996846	25	17	1
1997809	6	20382	1193125	25	245090	1
1997845	29	20382	1104659	25	100975	1
1998250	6	20382	1998250	25	11	1
1998559	59	20382	1998559	25	45	1
1998738	29	20382	1437749	25	31422	1
1998822	46	20382	1193125	25	244366	1
1999127	29	20382	1999127	25	2	1
1999262	29	20382	1999262	25	3	1
1999826	6	20382	1999826	25	2	1
1999883	29	20382	1999883	25	2	1
2000775	12	20382	1829126	25	8277	1
2001520	4	20382	2001520	25	5	1
2001527	70	20382	2001527	25	6	1
2001544	4	20382	1172661	25	4338	1
2001616	29	20382	2001616	25	3	1
2002236	3	20382	1213900	25	100518	1
200245	1	20382	950103	25	13414	1
200245	1	20382	950103	25	13424	1
200245	1	20382	950103	25	13430	1
200245	1	20382	950103	25	13434	1
200245	1	20382	950103	25	13437	1
200245	1	20382	950103	25	13441	1
200245	1	20382	950103	25	13446	1
200245	1	20382	950103	25	13448	1
200245	1	20382	950103	25	13449	1
200245	1	20382	950103	25	13450	1
200245	1	20382	950103	25	13461	1
200245	1	20382	950103	25	13463	1
200245	1	20382	950103	25	13464	1
200245	1	20382	950103	25	13469	1
200245	1	20382	950103	25	13471	1
200245	1	20382	950103	25	13473	1
200245	1	20382	1918704	25	17736	1
200245	1	20382	1918704	25	17738	1
200245	1	20382	1918704	25	17739	1
200245	1	20382	1918704	25	17740	1
200245	1	20382	1918704	25	17741	1
200245	1	20382	1918704	25	17742	1
200245	1	20382	1918704	25	17746	1
200245	1	20382	1918704	25	17748	1
200245	1	20382	1918704	25	17752	1
200245	1	20382	1918704	25	17754	1
200245	1	20382	1918704	25	17755	1
200245	1	20382	1918704	25	17758	1
200245	1	20382	1918704	25	17759	1
200245	1	20382	1918704	25	17762	1
200245	1	20382	1918704	25	17763	1
200245	1	20382	1918704	25	17764	1
200245	1	20382	1918704	25	17765	1
200245	1	20382	1918704	25	17766	1
200245	1	20382	1918704	25	17767	1
200245	1	20382	1918704	25	17768	1
200245	1	20382	1918704	25	17770	1
200245	1	20382	1918704	25	17771	1
200245	1	20382	1918704	25	17772	1
200245	1	20382	1918704	25	17773	1
200245	1	20382	1918704	25	17774	1
200245	1	20382	1918704	25	17775	1
200245	1	20382	1918704	25	17776	1
200245	1	20382	1918704	25	17777	1
200245	1	20382	1918704	25	17778	1
200245	1	20382	1918704	25	17779	1
200245	1	20382	1918704	25	17780	1
200245	1	20382	1918704	25	17781	1
200245	1	20382	1918704	25	17782	1
200245	1	20382	1918704	25	17783	1
200245	1	20382	1918704	25	17784	1
200245	1	20382	1918704	25	17785	1
200245	1	20382	1918704	25	17786	1
200245	1	20382	1918704	25	17787	1
200245	1	20382	1918704	25	17788	1
200245	1	20382	1918704	25	17789	1
200245	1	20382	1918704	25	17790	1
200245	1	20382	1918704	25	17791	1
200245	1	20382	1918704	25	17792	1
200245	1	20382	1918704	25	17793	1
200245	1	20382	1918704	25	17794	1
200245	1	20382	1918704	25	17795	1
200245	1	20382	1918704	25	17796	1
200245	1	20382	1918704	25	17797	1
200245	1	20382	1918704	25	17798	1
200245	1	20382	1918704	25	17799	1
200245	1	20382	1918704	25	17800	1
200245	1	20382	1918704	25	17801	1
200245	1	20382	1918704	25	17802	1
200245	1	20382	1918704	25	17804	1
200245	1	20382	1918704	25	17805	1
200245	1	20382	1918704	25	17810	1
200245	1	20382	1918704	25	17814	1
200245	1	20382	1918704	25	17815	1
200245	1	20382	1918704	25	17826	1
200245	1	20382	1918704	25	17827	1
200245	1	20382	1918704	25	17845	1
200245	1	20382	1918704	25	17847	1
200245	1	20382	1918704	25	17850	1
200245	1	20382	1918704	25	17861	1
200245	1	20382	1918704	25	17889	1
200245	1	20382	1918704	25	17890	1
200245	1	20382	1918704	25	17891	1
200245	1	20382	1918704	25	17892	1
200245	1	20382	1918704	25	17900	1
200245	23	20382	950103	25	13428	1
200245	23	20382	950103	25	13451	1
200245	2	20382	1918704	25	17757	1
200245	2	20382	1918704	25	17813	1
200245	2	20382	1918704	25	17859	1
2003007	46	20382	2003007	25	35	1
2003061	3	20382	1213900	25	100533	1
2004982	59	20382	1888524	25	17908	1
2004982	46	20382	1888524	25	17909	1
2005257	6	20382	1628280	25	45760	1
2005575	6	20382	1628280	25	45686	1
200648	4	20382	1754960	25	698	1
2006815	88	20382	1829126	25	8293	1
2006815	9	20382	1829126	25	8292	1
2006933	59	20382	2006933	25	45	1
2007274	6	20382	1193125	25	245564	1
2008608	29	20382	2008608	25	4	1
2009273	4	20382	2009273	25	2	1
2010507	4	20382	2010507	25	6	1
2010959	75	20382	1213900	25	100561	1
2011000	4	20382	1754960	25	699	1
2011053	3	20382	1493152	25	18718	1
2011201	4	20382	2011201	25	5	1
2011208	9	20382	1493152	25	18815	1
2011427	4	20382	2011427	25	4	1
2011580	4	20382	2011580	25	9	1
2011807	6	20382	1225208	25	8706	1
2011895	6	20382	2011895	25	13	1
2012047	6	20382	2012047	25	14	1
2012578	6	20382	6955	25	49	1
2012600	3	20382	1493152	25	18796	1
2013090	19	20382	1213900	25	100558	1
2013919	46	20382	2013919	25	34	1
2014176	59	20382	2014176	25	45	1
2014337	21	20382	1354457	25	1049	1
2014640	6	20382	1550695	25	101	1
2014677	6	20382	1185185	25	1506	1
2016056	70	20382	2016056	25	2	1
2016072	88	20382	1213900	25	100448	1
2016960	6	20382	891103	25	174	1
2016973	46	20382	1193125	25	244342	1
2016991	29	20382	2016991	25	9	1
2018222	3	20382	1493152	25	18793	1
2018244	29	20382	1012975	25	650	1
2018847	29	20382	1012975	25	649	1
2019435	3	20382	1213900	25	100542	1
2019435	77	20382	1213900	25	100891	1
2019435	77	20382	1213900	25	100897	1
2019435	57	20382	1213900	25	100887	1
2019793	74	20382	1493152	25	18705	1
2021208	4	20382	2021208	25	12	1
2021997	70	20382	2021997	25	2	1
2023493	4	20382	2063364	25	242	1
2023554	6	20382	1363249	25	106	1
2023568	4	20382	2085853	25	123	1
2023756	59	20382	2023756	25	45	1
2024049	4	20382	2024049	25	8	1
2024378	6	20382	1225208	25	8707	1
2024984	6	20382	80420	25	136	1
2025015	6	20382	1225208	25	8703	1
2025072	7	20382	1969223	25	863	1
2025072	7	20382	1969223	25	864	1
2025072	6	20382	1225208	25	8713	1
2026150	4	20382	1172661	25	4346	1
2026197	46	20382	2026197	25	34	1
2026391	4	20382	2063364	25	244	1
2026738	9	20382	1193125	25	245380	1
2026767	8	20382	1094891	25	54	1
2026767	8	20382	1094891	25	69	1
2026767	8	20382	1094891	25	71	1
2026767	8	20382	1094891	25	75	1
2026767	8	20382	1094891	25	77	1
2026767	8	20382	1094891	25	79	1
2026767	8	20382	1094891	25	81	1
2026767	56	20382	1493152	25	18728	1
2026767	21	20382	1354457	25	1047	1
2027613	13	20382	1214659	25	15166	1
2027960	6	20382	1493152	25	18843	1
2028336	62	20382	1213900	25	100507	1
2028621	4	20382	2028621	25	2	1
2028707	9	20382	1213900	25	100879	1
2029654	59	20382	2029654	25	46	1
2030522	70	20382	1709409	25	18	1
2030635	6	20382	1225208	25	8702	1
2030763	8	20382	1493152	25	18766	1
2030763	91	20382	1493152	25	18822	1
2031235	4	20382	1754960	25	697	1
2031283	9	20382	1104659	25	101057	1
2031750	9	20382	2031750	25	35	1
2031960	6	20382	1225208	25	8686	1
2032432	6	20382	1213900	25	100922	1
2032544	4	20382	2032544	25	6	1
2032687	70	20382	2032687	25	3	1
2033071	92	20382	2033071	25	4	1
2033250	46	20382	1193125	25	244345	1
2033312	4	20382	2033312	25	2	1
2033535	3	20382	950157	25	880	1
2033921	59	20382	2033921	25	45	1
2034160	7	20382	2071842	25	9	1
2034978	70	20382	2034978	25	2	1
2035992	75	20382	1213900	25	100671	1
2036042	7	20382	1628280	25	45704	1
2036042	7	20382	1628280	25	45708	1
2036042	7	20382	1950047	25	8093	1
2036042	6	20382	1451612	25	12	1
2036069	29	20382	2036069	25	2	1
2036135	29	20382	2036135	25	2	1
2036136	29	20382	2036136	25	2	1
2036137	29	20382	2036137	25	2	1
2036142	8	20382	921895	25	2783	1
2036142	6	20382	921895	25	2784	1
2036648	93	20382	1104659	25	101071	1
2036778	6	20382	1628280	25	45622	1
2036780	46	20382	2036780	25	34	1
2037436	29	20382	2037436	25	2	1
2037437	29	20382	2037437	25	2	1
2037438	29	20382	2037438	25	2	1
2037949	94	20382	947871	25	915	1
2037949	94	20382	947871	25	916	1
2038185	70	20382	1213900	25	100637	1
2038185	70	20382	1213900	25	100745	1
2038510	29	20382	2038510	25	2	1
2038992	29	20382	2038992	25	2	1
2039243	6	20382	891103	25	164	1
2039300	4	20382	2039300	25	9	1
2039570	94	20382	947871	25	915	1
2039570	94	20382	947871	25	916	1
2040032	29	20382	919574	25	6203	1
2040040	29	20382	2040040	25	2	1
2040041	29	20382	2040041	25	2	1
2040538	6	20382	2040538	25	2	1
2040820	29	20382	2040820	25	2	1
2040822	29	20382	2040822	25	2	1
2040834	29	20382	2040834	25	2	1
2040995	29	20382	906791	25	20	1
2041234	6	20382	1683168	25	7702	1
2041324	29	20382	2041324	25	9	1
2041707	29	20382	902664	25	4472	1
2041900	20	20382	1193125	25	244527	1
2041913	8	20382	921895	25	2783	1
2041913	6	20382	921895	25	2784	1
2042059	53	20382	2042059	25	5	1
2042378	29	20382	2042378	25	4	1
2042408	70	20382	2042408	25	2	1
2042453	59	20382	2042453	25	45	1
2042544	83	20382	2042544	25	5	1
2043198	29	20382	2043198	25	17	1
2043954	35	20382	1999371	25	15708	1
2043954	35	20382	1999371	25	15708	1
2043954	15	20382	1999371	25	15772	1
2043954	15	20382	1999371	25	15772	1
2043954	15	20382	1999371	25	15773	1
2043954	15	20382	1999371	25	15773	1
2043954	15	20382	1999371	25	15774	1
2043954	15	20382	1999371	25	15774	1
2044492	46	20382	1193125	25	244368	1
2045642	7	20382	1958244	25	4408	1
2046656	3	20382	1213900	25	100832	1
2046751	4	20382	1123292	25	576	1
2046881	6	20382	354647	25	12	1
2046919	57	20382	1493152	25	18748	1
2047316	46	20382	2047316	25	31	1
2047442	23	20382	1104659	25	101212	1
2047697	29	20382	2047697	25	5	1
2048361	13	20382	1213900	25	100942	1
2048913	59	20382	2048913	25	38	1
2049733	8	20382	1213900	25	100810	1
2049733	6	20382	1213900	25	100920	1
2049733	6	20382	1213900	25	100922	1
2049733	9	20382	2049733	25	36	1
2049733	19	20382	1213900	25	100923	1
2049857	4	20382	2049857	25	5	1
2050755	6	20382	2050755	25	19	1
2051303	29	20382	2051303	25	2	1
2051365	13	20382	1213900	25	100714	1
2051630	35	20382	930413	25	3245	1
2051630	35	20382	930413	25	3245	1
2051630	5	20382	930413	25	3246	1
2051665	7	20382	1950047	25	8098	1
2051717	4	20382	1725547	25	4186	1
2052205	6	20382	785557	25	147	1
2053013	4	20382	2053013	25	7	1
2055178	4	20382	2055178	25	2	1
2055414	4	20382	2055414	25	8	1
2055570	4	20382	2055570	25	2	1
2055592	31	20382	1104659	25	101242	1
2055836	4	20382	2055836	25	5	1
2056037	4	20382	2056037	25	11	1
2056063	25	20382	1104659	25	101306	1
2056063	25	20382	1104659	25	101306	1
2056135	54	20382	1528621	25	1069	1
2056263	88	20382	1213900	25	100468	1
2056263	88	20382	1213900	25	100469	1
2056795	4	20382	2056795	25	6	1
2056795	4	20382	2056795	25	7	1
2057088	6	20382	1266824	25	213	1
2057342	59	20382	2057342	25	31	1
2057809	6	20382	891103	25	166	1
2057896	6	20382	1213900	25	100920	1
2058637	70	20382	2058637	25	5	1
2058897	3	20382	2058897	25	45	1
2060016	21	20382	1354457	25	1048	1
2060144	6	20382	1363249	25	106	1
2060298	4	20382	1172661	25	4341	1
2060415	35	20382	930413	25	3249	1
2060415	35	20382	930413	25	3249	1
2060535	46	20382	2060535	25	39	1
2060744	6	20382	891103	25	176	1
2061818	4	20382	1214659	25	15127	1
2062312	70	20382	2062312	25	2	1
2064001	4	20382	2063364	25	246	1
2064260	6	20382	1213900	25	100920	1
2064489	4	20382	2063364	25	250	1
2064615	46	20382	1193125	25	244343	1
2064729	6	20382	1628280	25	45699	1
2065254	70	20382	2065254	25	1	1
2066736	6	20382	2066736	25	2	1
2066812	4	20382	2066812	25	6	1
2067339	4	20382	1214659	25	15125	1
2068385	14	20382	1829126	25	8317	1
2069480	6	20382	2069480	25	5	1
2069695	29	20382	2069695	25	2	1
2069728	29	20382	2069728	25	1	1
2070261	95	20382	1213900	25	100884	1
2070429	70	20382	2070429	25	3	1
2071240	46	20382	2071240	25	13	1
2071444	70	20382	1315863	25	767	1
2071803	70	20382	1315863	25	768	1
2071873	7	20382	1959173	25	6513	1
2072421	38	20382	943374	25	442	1
2073307	70	20382	2073307	25	3	1
2075541	83	20382	1669191	25	518	1
2075816	37	20382	1354457	25	1046	1
2076163	88	20382	1213900	25	100468	1
2076163	88	20382	1213900	25	100469	1
2076477	70	20382	2076477	25	1	1
2076786	19	20382	1493152	25	18777	1
2076830	70	20382	1470831	25	269	1
2077002	70	20382	929638	25	3934	1
2077045	70	20382	1470831	25	268	1
2077718	4	20382	2077718	25	2	1
2077855	70	20382	2077855	25	1	1
2078618	54	20382	1445546	25	6959	1
2078621	96	20382	1445546	25	6954	1
2078623	96	20382	1445546	25	6955	1
2078627	96	20382	1445546	25	6953	1
2078639	54	20382	1445546	25	6958	1
2078640	54	20382	1445546	25	6957	1
2078641	54	20382	1445546	25	6956	1
2078928	70	20382	2078928	25	1	1
2078929	70	20382	2078928	25	1	1
2079094	70	20382	2079094	25	1	1
2079516	70	20382	2079516	25	1	1
2080334	88	20382	1213900	25	100818	1
2080931	70	20382	2080931	25	1	1
2081294	29	20382	2081294	25	4	1
2081611	70	20382	2081611	25	1	1
2081847	4	20382	2081847	25	2	1
2082185	29	20382	2082185	25	3	1
2082453	70	20382	2082453	25	1	1
2082505	7	20382	2082505	25	1	1
2082686	97	20382	2082686	25	2	1
2082903	59	20382	2082903	25	4	1
2082951	70	20382	2082951	25	1	1
2083410	52	20382	1193125	25	244918	1
2083466	98	20382	1445546	25	6947	1
2083565	98	20382	1445546	25	6948	1
2083574	98	20382	1445546	25	6949	1
2083577	98	20382	1445546	25	6950	1
2083579	98	20382	1445546	25	6951	1
2083580	98	20382	1445546	25	6952	1
2084328	29	20382	2084328	25	2	1
2084352	70	20382	2084352	25	1	1
2084404	46	20382	2084404	25	3	1
2084480	70	20382	2084480	25	11	1
2084640	70	20382	2084640	25	1	1
2085025	70	20382	2085025	25	1	1
2085026	70	20382	2085026	25	1	1
2085067	6	20382	2085067	25	5	1
2085200	6	20382	1398344	25	19502	1
2085432	70	20382	2085432	25	1	1
2085501	70	20382	2085501	25	1	1
2085897	70	20382	2085897	25	3	1
2085904	70	20382	1013594	25	1233	1
2086297	70	20382	2086297	25	1	1
2086306	70	20382	2086306	25	1	1
2086457	29	20382	2086457	25	2	1
2086467	29	20382	2086467	25	3	1
2086606	70	20382	2086606	25	1	1
2086696	92	20382	2086696	25	2	1
2086932	70	20382	1123292	25	574	1
2087066	70	20382	2087066	25	1	1
2087218	70	20382	1315863	25	769	1
2087328	70	20382	2087328	25	1	1
2087443	70	20382	1470831	25	267	1
2087444	70	20382	1470831	25	266	1
2087651	70	20382	2087651	25	1	1
2087680	70	20382	2087680	25	1	1
2087714	70	20382	2087714	25	1	1
2087726	70	20382	2087726	25	1	1
2087760	8	20382	1213900	25	100810	1
2087760	6	20382	1213900	25	100920	1
2087829	70	20382	2087829	25	2	1
2087969	70	20382	2087969	25	1	1
2088358	70	20382	2088358	25	1	1
2088392	8	20382	1213900	25	100810	1
2088392	6	20382	1213900	25	100920	1
2088715	70	20382	2088715	25	1	1
2088723	70	20382	2088723	25	1	1
2088784	70	20382	2088784	25	1	1
2088785	70	20382	2088785	25	1	1
2088786	70	20382	2088786	25	1	1
2088787	70	20382	2088787	25	1	1
2088817	70	20382	2088817	25	1	1
2088860	8	20382	1903596	25	494	1
2088860	40	20382	1903596	25	498	1
2088860	6	20382	1903596	25	495	1
2088889	70	20382	2088889	25	1	1
2088955	70	20382	2088955	25	1	1
2088956	70	20382	2088956	25	1	1
2089000	29	20382	2089000	25	3	1
2089260	70	20382	2089260	25	1	1
2089296	38	20382	1731122	25	1422	1
2089426	8	20382	1094891	25	54	1
2089500	70	20382	2089500	25	1	1
2089797	70	20382	2089797	25	1	1
2089841	70	20382	2089841	25	1	1
2090254	70	20382	2090254	25	1	1
2090458	70	20382	2090458	25	1	1
2090481	8	20382	1213900	25	100756	1
2090481	8	20382	1213900	25	100759	1
2090481	8	20382	1213900	25	100762	1
2090768	70	20382	2090768	25	1	1
2090871	70	20382	2090871	25	1	1
2090874	70	20382	2090874	25	1	1
2090884	70	20382	2090884	25	1	1
2090929	70	20382	2090929	25	1	1
2091016	70	20382	2091016	25	1	1
2091017	70	20382	2091017	25	1	1
2091286	8	20382	2091286	25	1	1
2091286	8	20382	2091286	25	2	1
2091286	8	20382	2091286	25	3	1
2091385	92	20382	2091385	25	1	1
2091460	94	20382	1193125	25	244319	1
2091460	99	20382	1193125	25	244485	1
2091481	6	20382	2091481	25	2	1
2091492	70	20382	1376474	25	853	1
2091545	70	20382	902664	25	4488	1
2091555	92	20382	2091555	25	1	1
2091562	27	20382	1539497	25	2756	1
2091562	46	20382	1539497	25	2750	1
2091562	2	20382	1539497	25	2746	1
2091562	2	20382	1539497	25	2748	1
2091562	2	20382	1539497	25	2752	1
2091562	2	20382	1539497	25	2754	1
2091580	70	20382	902664	25	4487	1
2091629	19	20382	2091629	25	7	1
2091706	70	20382	2091706	25	1	1
2091716	70	20382	2091716	25	1	1
2091726	29	20382	2091726	25	2	1
2091775	70	20382	2091775	25	1	1
2091783	70	20382	2091783	25	1	1
2091795	70	20382	2091795	25	1	1
2091858	70	20382	2091858	25	1	1
2091875	70	20382	2091875	25	1	1
2091888	70	20382	2091888	25	1	1
2091918	8	20382	2091918	25	1	1
2091929	70	20382	2091929	25	1	1
2091999	8	20382	1628280	25	45607	1
2092008	29	20382	1636587	25	55	1
2092027	70	20382	2092027	25	1	1
2092068	8	20382	1628280	25	45594	1
2092077	70	20382	2092077	25	1	1
2092083	70	20382	2092083	25	1	1
2092154	8	20382	1185185	25	1502	1
2092243	70	20382	912282	25	1103	1
2092270	70	20382	2092270	25	1	1
2092359	70	20382	2092359	25	1	1
2092360	70	20382	2092360	25	1	1
2092364	70	20382	2092364	25	1	1
2092367	70	20382	2092367	25	1	1
2092394	70	20382	2092394	25	1	1
2092402	8	20382	1193125	25	245061	1
2092403	70	20382	2092403	25	1	1
2092431	70	20382	2092431	25	1	1
2092454	70	20382	2092454	25	1	1
2092473	70	20382	2092473	25	1	1
2092475	70	20382	2092475	25	1	1
2092477	70	20382	2092477	25	1	1
2092480	70	20382	2092480	25	1	1
2092516	28	20382	902664	25	4486	1
2092560	70	20382	2092560	25	1	1
2092581	70	20382	2092581	25	1	1
2092592	88	20381	950103	25	13406	1
2092592	88	20382	950103	25	13462	1
2092593	8	20382	1193125	25	245087	1
2092593	6	20382	1193125	25	245114	1
2092599	70	20382	2092599	25	1	1
2092600	70	20382	2092600	25	1	1
2092601	70	20382	2092601	25	1	1
2092604	70	20382	2092604	25	1	1
2092622	70	20382	2092622	25	1	1
2092623	70	20382	2092623	25	1	1
2092629	8	20382	1163739	25	27	1
2092629	6	20382	1163739	25	29	1
2092631	8	20382	1437749	25	31444	1
2092642	70	20382	2092642	25	1	1
2092648	70	20382	2092648	25	1	1
2092649	70	20382	2092649	25	1	1
2092658	70	20382	2092658	25	1	1
2092659	70	20382	2092659	25	1	1
2092664	70	20382	2092664	25	1	1
2092667	70	20382	2092667	25	2	1
2092677	70	20382	2092677	25	2	1
2092690	70	20382	2092690	25	1	1
2092702	70	20382	2092702	25	1	1
2092705	70	20382	2092705	25	1	1
2092727	70	20382	2092727	25	1	1
2092732	70	20382	2092732	25	1	1
2092803	70	20382	2092803	25	1	1
2092815	70	20382	2092815	25	1	1
2092816	70	20382	2092816	25	1	1
2092819	70	20382	2092819	25	1	1
2092824	70	20382	2092824	25	1	1
2092825	70	20382	2092825	25	1	1
2092833	70	20382	2092833	25	1	1
2092835	70	20382	905148	25	3638	1
2092854	8	20382	1628280	25	45734	1
2092854	6	20382	1628280	25	45735	1
2092872	70	20382	2092872	25	1	1
2092876	70	20382	2092876	25	1	1
2092910	70	20382	2092910	25	1	1
2092913	70	20382	2092913	25	1	1
2092915	8	20382	1437749	25	31408	1
2092918	70	20382	2092918	25	1	1
2092920	70	20382	947871	25	918	1
2092947	70	20382	2092947	25	1	1
2092948	70	20382	1062993	25	16245	1
2092983	70	20382	2092983	25	1	1
2092986	70	20382	2092986	25	1	1
2093020	70	20382	902664	25	4495	1
2098	9	20382	1193125	25	244419	1
21344	9	20382	1628280	25	45577	1
217410	3	20382	217410	25	54	1
217410	3	20382	217410	25	56	1
22444	6	20382	1531183	25	7	1
225030	5	20382	1999371	25	15761	1
277638	6	20382	1628280	25	45653	1
277948	7	20382	1950047	25	8086	1
277948	6	20382	1193125	25	245241	1
27904	7	20382	1959173	25	6515	1
29989	9	20382	29989	25	35	1
30162	22	20382	940400	25	4990	1
30625	8	20382	1628280	25	45607	1
312070	1	20382	950103	25	13425	1
312070	1	20382	950103	25	13442	1
312070	1	20382	950103	25	13447	1
312070	1	20382	950103	25	13452	1
312070	1	20382	950103	25	13453	1
312070	1	20382	950103	25	13454	1
312070	1	20382	950103	25	13455	1
312070	1	20382	950103	25	13456	1
312070	1	20382	950103	25	13457	1
312070	1	20382	950103	25	13458	1
312070	1	20382	1918704	25	17803	1
312070	1	20382	1918704	25	17806	1
312070	1	20382	1918704	25	17807	1
312070	1	20382	1918704	25	17808	1
312070	1	20382	1918704	25	17809	1
312070	1	20382	1918704	25	17811	1
312070	1	20382	1918704	25	17823	1
312070	1	20382	1918704	25	17824	1
312070	1	20382	1918704	25	17825	1
312070	1	20382	1918704	25	17828	1
312070	1	20382	1918704	25	17833	1
312070	1	20382	1918704	25	17849	1
312070	1	20382	1918704	25	17851	1
312070	1	20382	1918704	25	17855	1
312070	1	20382	1918704	25	17868	1
313616	12	20382	313616	25	182	1
313616	9	20382	313616	25	180	1
315189	4	20382	315189	25	4	1
315774	35	20382	1398344	25	19474	1
315774	35	20382	1398344	25	19474	1
318300	9	20382	318300	25	285	1
319654	9	20382	1193125	25	244585	1
319655	9	20382	1193125	25	244549	1
320121	6	20382	1356849	25	22	1
320121	6	20382	1357717	25	14	1
320121	6	20382	1872955	25	15	1
320121	6	20382	1909327	25	15	1
320121	6	20382	2011895	25	13	1
320121	6	20382	2012047	25	14	1
33185	12	20382	33185	25	64	1
33185	9	20382	33185	25	61	1
33213	9	20382	33213	25	47	1
351834	6	20382	351834	25	5	1
351834	6	20382	351834	25	7	1
351834	6	20382	351834	25	9	1
351834	6	20382	351834	25	11	1
351834	6	20382	351834	25	13	1
351834	6	20382	351834	25	15	1
351834	6	20382	351834	25	17	1
352960	3	20382	1104659	25	101079	1
353184	9	20382	353184	25	113	1
353278	3	20382	1171843	25	6550	1
353278	3	20382	1171843	25	6551	1
353278	13	20382	950103	25	13417	1
354647	6	20382	354647	25	12	1
357173	9	20382	357173	25	86	1
357301	9	20382	1140361	25	38829	1
36104	6	20382	1225208	25	8684	1
36104	6	20382	1225208	25	8685	1
36405	5	20382	1193125	25	244346	1
38264	9	20382	1683168	25	7687	1
40211	9	20382	40211	25	105	1
40417	6	20382	40417	25	46	1
40545	12	20382	40545	25	132	1
40545	9	20382	40545	25	131	1
40987	12	20382	40987	25	196	1
40987	9	20382	40987	25	194	1
43920	7	20382	1972481	25	255	1
45012	9	20382	45012	25	68	1
47111	6	20382	47111	25	171	1
47111	9	20382	1628280	25	45714	1
4962	1	20382	1193125	25	245381	1
50471	6	20382	1143335	25	13	1
52848	5	20382	1193125	25	244346	1
63276	9	20382	1628280	25	45690	1
64463	9	20382	1493152	25	18719	1
66496	9	20382	1193125	25	244569	1
66740	12	20382	66740	25	89	1
66740	9	20382	66740	25	86	1
67887	6	20382	1251987	25	8	1
6845	6	20382	1741720	25	4	1
6845	6	20382	1869972	25	4	1
6845	6	20382	2085067	25	5	1
6955	6	20382	6955	25	47	1
6955	6	20382	6955	25	49	1
700564	9	20382	700564	25	52	1
700564	31	20382	1193125	25	245232	1
70145	9	20382	1193125	25	245201	1
70487	6	20382	1008886	25	275	1
70487	6	20382	1008886	25	277	1
70487	6	20382	1008886	25	279	1
70502	23	20382	70502	25	456	1
707605	9	20382	1104659	25	101052	1
70858	1	20382	1213900	25	100747	1
70858	1	20382	1213900	25	100773	1
70858	1	20382	1918704	25	17731	1
70858	1	20382	1918704	25	17732	1
70858	1	20382	1918704	25	17733	1
70858	1	20382	1918704	25	17734	1
70858	1	20382	1918704	25	17735	1
70858	1	20382	1918704	25	17737	1
70858	1	20382	1918704	25	17743	1
70858	1	20382	1918704	25	17744	1
70858	1	20382	1918704	25	17745	1
70858	1	20382	1918704	25	17747	1
70858	1	20382	1918704	25	17751	1
70858	1	20382	1918704	25	17753	1
70858	1	20382	1918704	25	17760	1
70858	1	20382	1918704	25	17761	1
70858	1	20382	1918704	25	17769	1
70858	1	20382	1918704	25	17816	1
70858	1	20382	1918704	25	17817	1
70858	1	20382	1918704	25	17818	1
70858	1	20382	1918704	25	17819	1
70858	1	20382	1918704	25	17820	1
70858	1	20382	1918704	25	17821	1
70858	1	20382	1918704	25	17822	1
70858	1	20382	1918704	25	17829	1
70858	1	20382	1918704	25	17830	1
70858	1	20382	1918704	25	17831	1
70858	1	20382	1918704	25	17832	1
70858	1	20382	1918704	25	17834	1
70858	1	20382	1918704	25	17835	1
70858	1	20382	1918704	25	17836	1
70858	1	20382	1918704	25	17837	1
70858	1	20382	1918704	25	17838	1
70858	1	20382	1918704	25	17839	1
70858	1	20382	1918704	25	17840	1
70858	1	20382	1918704	25	17841	1
70858	1	20382	1918704	25	17842	1
70858	1	20382	1918704	25	17843	1
70858	1	20382	1918704	25	17844	1
70858	1	20382	1918704	25	17846	1
70858	1	20382	1918704	25	17848	1
70858	1	20382	1918704	25	17852	1
70858	1	20382	1918704	25	17853	1
70858	1	20382	1918704	25	17854	1
70858	1	20382	1918704	25	17856	1
70858	1	20382	1918704	25	17858	1
70858	1	20382	1918704	25	17860	1
70858	1	20382	1918704	25	17862	1
70858	1	20382	1918704	25	17863	1
70858	1	20382	1918704	25	17864	1
70858	1	20382	1918704	25	17865	1
70858	1	20382	1918704	25	17866	1
70858	1	20382	1918704	25	17867	1
70858	1	20382	1918704	25	17869	1
70858	1	20382	1918704	25	17870	1
70858	1	20382	1918704	25	17871	1
70858	1	20382	1918704	25	17872	1
70858	1	20382	1918704	25	17873	1
70858	1	20382	1918704	25	17874	1
70858	1	20382	1918704	25	17875	1
70858	1	20382	1918704	25	17876	1
70858	1	20382	1918704	25	17877	1
70858	1	20382	1918704	25	17878	1
70858	1	20382	1918704	25	17879	1
70858	1	20382	1918704	25	17880	1
70858	1	20382	1918704	25	17881	1
70858	1	20382	1918704	25	17882	1
70858	1	20382	1918704	25	17883	1
70858	1	20382	1918704	25	17884	1
70858	1	20382	1918704	25	17885	1
70858	1	20382	1918704	25	17886	1
70858	1	20382	1918704	25	17887	1
70858	1	20382	1918704	25	17888	1
70858	1	20382	1918704	25	17893	1
70858	1	20382	1918704	25	17894	1
70858	1	20382	1918704	25	17895	1
70858	1	20382	1918704	25	17896	1
70858	1	20382	1918704	25	17897	1
70858	1	20382	1918704	25	17898	1
70858	1	20382	1918704	25	17899	1
70858	1	20382	1918704	25	17901	1
70858	2	20382	1918704	25	17749	1
709283	61	20382	1539497	25	2758	1
710826	5	20382	1193125	25	244473	1
712050	4	20382	2063364	25	252	1
712515	6	20382	712515	25	57	1
713676	6	20382	1628280	25	45622	1
716314	9	20382	1193125	25	244287	1
71691	28	20382	919574	25	6210	1
717538	4	20382	717538	25	86	1
718413	9	20382	1654954	25	12006	1
718937	82	20382	1193125	25	244217	1
718937	19	20382	1193125	25	244202	1
720309	55	20382	1193125	25	244340	1
720309	5	20382	1193125	25	244337	1
723125	6	20382	1652149	25	6	1
723125	9	20382	1104659	25	101237	1
723188	9	20382	1104659	25	101075	1
72331	7	20382	1959173	25	6510	1
726601	9	20382	726601	25	40	1
729596	100	20382	729596	25	3	1
73124	6	20382	1950022	25	4	1
732712	6	20382	1215315	25	9	1
734383	5	20382	1193125	25	244346	1
738214	9	20382	1437749	25	31431	1
74046	6	20382	1628280	25	45677	1
74046	6	20382	1628280	25	45680	1
74046	6	20382	1628280	25	45682	1
74046	6	20382	1628280	25	45684	1
74046	6	20382	1628280	25	45686	1
740858	5	20382	740858	25	15	1
743367	9	20382	1104659	25	101299	1
746210	61	20382	1437749	25	31419	1
751978	7	20382	1950047	25	8096	1
751978	9	20382	1193125	25	245175	1
75362	9	20382	1193125	25	244291	1
754811	4	20382	1437749	25	31428	1
763563	9	20382	1171843	25	6565	1
763907	9	20382	1104659	25	100984	1
764478	7	20382	1967940	25	77	1
764624	22	20382	940400	25	4848	1
766011	3	20382	1171843	25	6537	1
766285	5	20382	1398344	25	19406	1
771999	101	20382	1493152	25	18759	1
77360	12	20382	77360	25	47	1
77360	9	20382	77360	25	44	1
77360	9	20382	77360	25	45	1
773757	20	20382	1193125	25	244539	1
779152	18	20382	779152	25	85	1
779335	6	20382	1214659	25	15164	1
785557	6	20382	785557	25	147	1
789019	79	20382	1193125	25	245177	1
789019	32	20382	1193125	25	245150	1
789019	18	20382	1193125	25	245169	1
790526	78	20382	1683168	25	7692	1
790526	9	20382	1683168	25	7694	1
793074	9	20382	793074	25	50	1
799850	6	20382	1683168	25	7702	1
803578	7	20382	2071842	25	9	1
803649	30	20382	803649	25	68	1
80420	6	20382	80420	25	136	1
804269	12	20382	804269	25	50	1
804269	9	20382	804269	25	49	1
806172	7	20382	1628280	25	45599	1
806633	5	20382	1193125	25	245161	1
806633	5	20382	1193125	25	245181	1
807249	19	20382	807249	25	144	1
811030	54	20382	894189	25	11552	1
811809	3	20382	1193125	25	244964	1
814586	19	20382	1683168	25	7688	1
818033	6	20382	1193125	25	244520	1
818033	6	20382	1193125	25	244560	1
818033	6	20382	1193125	25	244582	1
819940	22	20382	940400	25	4998	1
822416	12	20382	822416	25	61	1
822416	9	20382	822416	25	59	1
822977	15	20382	1193125	25	244703	1
822977	15	20382	1193125	25	244703	1
822977	22	20382	940400	25	4928	1
822977	22	20382	940400	25	4930	1
822977	22	20382	940400	25	4932	1
822977	22	20382	940400	25	4938	1
822977	22	20382	940400	25	4953	1
822977	22	20382	940400	25	4955	1
822977	22	20382	940400	25	4956	1
822977	22	20382	940400	25	4959	1
822977	22	20382	940400	25	4960	1
822977	22	20382	940400	25	4962	1
822977	22	20382	940400	25	4969	1
822977	22	20382	940400	25	4975	1
822977	22	20382	940400	25	4976	1
822977	22	20382	940400	25	4978	1
822977	22	20382	940400	25	4980	1
829323	9	20382	1654954	25	12011	1
831001	1	20382	950103	25	13414	1
831001	1	20382	950103	25	13424	1
831001	1	20382	950103	25	13430	1
831001	1	20382	950103	25	13434	1
831001	1	20382	950103	25	13437	1
831001	1	20382	950103	25	13441	1
831001	1	20382	950103	25	13443	1
831001	1	20382	950103	25	13446	1
831001	1	20382	950103	25	13448	1
831001	1	20382	950103	25	13449	1
831001	1	20382	950103	25	13450	1
831001	1	20382	950103	25	13461	1
831001	1	20382	950103	25	13463	1
831001	1	20382	950103	25	13464	1
831001	1	20382	950103	25	13469	1
831001	1	20382	950103	25	13471	1
831001	1	20382	950103	25	13473	1
831001	1	20382	1918704	25	17736	1
831001	1	20382	1918704	25	17738	1
831001	1	20382	1918704	25	17739	1
831001	1	20382	1918704	25	17740	1
831001	1	20382	1918704	25	17741	1
831001	1	20382	1918704	25	17742	1
831001	1	20382	1918704	25	17746	1
831001	1	20382	1918704	25	17748	1
831001	1	20382	1918704	25	17752	1
831001	1	20382	1918704	25	17754	1
831001	1	20382	1918704	25	17755	1
831001	1	20382	1918704	25	17758	1
831001	1	20382	1918704	25	17759	1
831001	1	20382	1918704	25	17762	1
831001	1	20382	1918704	25	17763	1
831001	1	20382	1918704	25	17764	1
831001	1	20382	1918704	25	17765	1
831001	1	20382	1918704	25	17766	1
831001	1	20382	1918704	25	17767	1
831001	1	20382	1918704	25	17768	1
831001	1	20382	1918704	25	17770	1
831001	1	20382	1918704	25	17771	1
831001	1	20382	1918704	25	17772	1
831001	1	20382	1918704	25	17773	1
831001	1	20382	1918704	25	17774	1
831001	1	20382	1918704	25	17775	1
831001	1	20382	1918704	25	17776	1
831001	1	20382	1918704	25	17777	1
831001	1	20382	1918704	25	17778	1
831001	1	20382	1918704	25	17779	1
831001	1	20382	1918704	25	17780	1
831001	1	20382	1918704	25	17781	1
831001	1	20382	1918704	25	17782	1
831001	1	20382	1918704	25	17783	1
831001	1	20382	1918704	25	17784	1
831001	1	20382	1918704	25	17785	1
831001	1	20382	1918704	25	17786	1
831001	1	20382	1918704	25	17787	1
831001	1	20382	1918704	25	17788	1
831001	1	20382	1918704	25	17789	1
831001	1	20382	1918704	25	17790	1
831001	1	20382	1918704	25	17791	1
831001	1	20382	1918704	25	17792	1
831001	1	20382	1918704	25	17793	1
831001	1	20382	1918704	25	17794	1
831001	1	20382	1918704	25	17795	1
831001	1	20382	1918704	25	17796	1
831001	1	20382	1918704	25	17797	1
831001	1	20382	1918704	25	17798	1
831001	1	20382	1918704	25	17799	1
831001	1	20382	1918704	25	17800	1
831001	1	20382	1918704	25	17801	1
831001	1	20382	1918704	25	17802	1
831001	1	20382	1918704	25	17804	1
831001	1	20382	1918704	25	17805	1
831001	1	20382	1918704	25	17810	1
831001	1	20382	1918704	25	17814	1
831001	1	20382	1918704	25	17815	1
831001	1	20382	1918704	25	17826	1
831001	1	20382	1918704	25	17827	1
831001	1	20382	1918704	25	17845	1
831001	1	20382	1918704	25	17847	1
831001	1	20382	1918704	25	17850	1
831001	1	20382	1918704	25	17861	1
831001	1	20382	1918704	25	17889	1
831001	1	20382	1918704	25	17890	1
831001	1	20382	1918704	25	17891	1
831001	1	20382	1918704	25	17892	1
831001	1	20382	1918704	25	17900	1
831001	23	20382	950103	25	13418	1
831001	23	20382	950103	25	13428	1
831001	23	20382	950103	25	13451	1
831001	2	20382	1918704	25	17756	1
831001	2	20382	1918704	25	17812	1
831001	2	20382	1918704	25	17857	1
831616	16	20382	1104659	25	100924	1
831616	16	20382	1104659	25	101239	1
832327	60	20382	1193125	25	245207	1
83246	1	20382	1104659	25	100912	1
83246	1	20382	1104659	25	100915	1
83246	1	20382	1104659	25	100967	1
83246	1	20382	1104659	25	101096	1
83246	1	20382	1104659	25	101111	1
83246	1	20382	1104659	25	101140	1
83246	1	20382	1104659	25	101144	1
83246	1	20382	1104659	25	101161	1
83246	1	20382	1104659	25	101164	1
83246	1	20382	1104659	25	101166	1
83246	1	20382	1104659	25	101171	1
83246	1	20382	1104659	25	101172	1
83246	1	20382	1104659	25	101176	1
83246	1	20382	1104659	25	101193	1
83246	1	20382	1104659	25	101196	1
83246	1	20382	1104659	25	101205	1
83246	1	20382	1104659	25	101211	1
83246	1	20382	1104659	25	101218	1
83246	1	20382	1104659	25	101236	1
83246	1	20382	1104659	25	101238	1
83246	1	20382	1104659	25	101257	1
83246	1	20382	1104659	25	101264	1
83246	1	20382	1104659	25	101265	1
83246	1	20382	1104659	25	101288	1
83246	1	20382	1104659	25	101311	1
83246	2	20382	1104659	25	100909	1
83246	2	20382	1104659	25	100937	1
83246	2	20382	1104659	25	101076	1
83246	2	20382	1104659	25	101084	1
83246	2	20382	1104659	25	101089	1
83246	2	20382	1104659	25	101093	1
83246	2	20382	1104659	25	101105	1
83246	2	20382	1104659	25	101115	1
83246	2	20382	1104659	25	101134	1
83246	2	20382	1104659	25	101136	1
83246	2	20382	1104659	25	101154	1
83246	2	20382	1104659	25	101231	1
83246	2	20382	1104659	25	101256	1
83246	2	20382	1104659	25	101307	1
835948	6	20382	1193125	25	245586	1
838618	4	20382	838618	25	8	1
844059	9	20382	844059	25	55	1
844150	3	20382	950103	25	13466	1
844150	3	20382	1654954	25	12022	1
845379	9	20382	1398344	25	19492	1
850027	6	20382	1038238	25	3	1
851066	10	20382	1104659	25	101120	1
851066	5	20382	1104659	25	101119	1
851066	11	20382	1104659	25	101123	1
851066	11	20382	1104659	25	101125	1
851066	11	20382	1104659	25	101126	1
851205	7	20382	1959173	25	6516	1
851693	102	20382	851693	25	260	1
851693	102	20382	851693	25	260	1
852772	8	20382	921895	25	2782	1
852772	8	20382	921895	25	2783	1
852772	6	20382	921895	25	2784	1
85535	9	20382	85535	25	149	1
856517	20	20382	1623632	25	1398	1
857588	10	20382	1104659	25	101121	1
857588	5	20382	1104659	25	101119	1
857588	11	20382	1104659	25	101125	1
857588	11	20382	1104659	25	101126	1
857949	30	20382	1213900	25	100566	1
858446	3	20382	1654954	25	12013	1
859737	9	20382	1193125	25	244423	1
859737	18	20382	1193125	25	244424	1
859737	18	20382	1193125	25	245274	1
859737	18	20382	1193125	25	245275	1
859737	18	20382	1193125	25	245276	1
860828	4	20382	860828	25	7	1
861842	9	20382	1437749	25	31420	1
862022	9	20382	1193125	25	244651	1
862084	5	20382	1193125	25	244348	1
866273	18	20382	866273	25	76	1
868278	61	20382	1493152	25	18798	1
868278	42	20382	1493152	25	18819	1
872080	4	20382	1213900	25	100586	1
880366	22	20382	940400	25	4841	1
880406	65	20382	1999371	25	15726	1
880417	9	20382	1193125	25	245118	1
881787	9	20382	1193125	25	244645	1
882443	55	20382	1193125	25	244332	1
882443	5	20382	1193125	25	244330	1
883782	4	20382	1193125	25	244959	1
884624	19	20382	1214659	25	15160	1
885307	9	20382	1079973	25	1631	1
886136	7	20382	1950047	25	8090	1
886982	1	20382	950103	25	13459	1
886982	1	20382	950103	25	13465	1
886982	1	20382	1193125	25	243863	1
886982	1	20382	1193125	25	244000	1
886982	1	20382	1193125	25	244001	1
886982	1	20382	1193125	25	244439	1
886982	1	20382	1193125	25	244615	1
886982	1	20382	1193125	25	244622	1
886982	1	20382	1193125	25	244624	1
886982	1	20382	1193125	25	244657	1
886982	1	20382	1193125	25	244687	1
886982	1	20382	1193125	25	244702	1
886982	1	20382	1193125	25	244715	1
886982	1	20382	1193125	25	244729	1
886982	1	20382	1193125	25	244773	1
886982	1	20382	1193125	25	244815	1
886982	1	20382	1193125	25	244867	1
886982	1	20382	1193125	25	244879	1
886982	1	20382	1193125	25	244882	1
886982	1	20382	1193125	25	244895	1
886982	1	20382	1193125	25	244934	1
886982	1	20382	1193125	25	245091	1
886982	1	20382	1193125	25	245095	1
886982	1	20382	1193125	25	245162	1
886982	1	20382	1193125	25	245182	1
886982	1	20382	1193125	25	245186	1
886982	1	20382	1193125	25	245203	1
886982	1	20382	1193125	25	245213	1
886982	1	20382	1193125	25	245215	1
886982	1	20382	1193125	25	245219	1
886982	1	20382	1193125	25	245229	1
886982	1	20382	1193125	25	245242	1
886982	1	20382	1193125	25	245243	1
886982	1	20382	1193125	25	245254	1
886982	1	20382	1193125	25	245255	1
886982	1	20382	1193125	25	245259	1
886982	1	20382	1193125	25	245260	1
886982	1	20382	1193125	25	245264	1
886982	1	20382	1193125	25	245281	1
886982	1	20382	1193125	25	245364	1
886982	1	20382	1193125	25	245365	1
886982	1	20382	1193125	25	245366	1
886982	1	20382	1193125	25	245369	1
886982	1	20382	1193125	25	245374	1
886982	1	20382	1193125	25	245376	1
886982	1	20382	1193125	25	245377	1
886982	1	20382	1193125	25	245378	1
886982	1	20382	1193125	25	245383	1
886982	1	20382	1193125	25	245384	1
886982	1	20382	1193125	25	245388	1
886982	1	20382	1193125	25	245389	1
886982	1	20382	1193125	25	245390	1
886982	9	20382	1193125	25	245194	1
886982	2	20382	1193125	25	244004	1
886982	2	20382	1193125	25	244008	1
886982	2	20382	1193125	25	244532	1
886982	2	20382	1193125	25	244941	1
889169	20	20382	889169	25	9	1
889512	22	20382	940400	25	4840	1
889512	22	20382	940400	25	4843	1
889512	22	20382	940400	25	4849	1
891103	6	20382	891103	25	162	1
891103	6	20382	891103	25	163	1
891103	6	20382	891103	25	164	1
891103	6	20382	891103	25	165	1
891103	6	20382	891103	25	166	1
891103	6	20382	891103	25	167	1
891103	6	20382	891103	25	168	1
891103	6	20382	891103	25	169	1
891103	6	20382	891103	25	170	1
891103	6	20382	891103	25	171	1
891103	6	20382	891103	25	172	1
891103	6	20382	891103	25	173	1
891103	6	20382	891103	25	174	1
891103	6	20382	891103	25	175	1
891103	6	20382	891103	25	176	1
891190	5	20382	1193125	25	244346	1
892450	3	20382	1193125	25	244197	1
892553	6	20382	1737892	25	3	1
894158	13	20382	902664	25	4480	1
89439	9	20382	89439	25	55	1
894556	6	20382	1381979	25	4	1
894556	9	20382	1640334	25	1859	1
894671	9	20382	894671	25	42	1
895421	1	20382	1839882	25	59319	1
895421	1	20382	1839882	25	59320	1
895421	1	20382	1839882	25	59369	1
895421	1	20382	1839882	25	59377	1
895421	1	20382	1839882	25	59379	1
895421	1	20382	1839882	25	59380	1
895421	1	20382	1839882	25	59382	1
895421	1	20382	1839882	25	59383	1
895421	1	20382	1839882	25	59384	1
895421	1	20382	1839882	25	59385	1
895421	1	20382	1839882	25	59386	1
895421	1	20382	1839882	25	59387	1
895421	1	20382	1839882	25	59388	1
895421	1	20382	1839882	25	59390	1
895421	1	20382	1839882	25	59391	1
895421	1	20382	1839882	25	59393	1
895421	1	20382	1839882	25	59394	1
895421	1	20382	1839882	25	59395	1
895421	1	20382	1839882	25	59396	1
895421	1	20382	1839882	25	59398	1
895421	1	20382	1839882	25	59399	1
895421	1	20382	1839882	25	59401	1
895421	1	20382	1839882	25	59423	1
895421	1	20382	1839882	25	59425	1
895421	1	20382	1839882	25	59431	1
895421	1	20382	1839882	25	59433	1
895421	1	20382	1839882	25	59450	1
895421	1	20382	1839882	25	59454	1
895421	1	20382	1839882	25	59457	1
895421	1	20382	1839882	25	59458	1
895421	1	20382	1839882	25	59467	1
895421	1	20382	1839882	25	59468	1
895421	1	20382	1839882	25	59479	1
895421	1	20382	1839882	25	59480	1
895421	1	20382	1839882	25	59483	1
895421	1	20382	1839882	25	59484	1
895421	1	20382	1839882	25	59486	1
895421	1	20382	1839882	25	59487	1
895421	1	20382	1839882	25	59489	1
895421	1	20382	1839882	25	59492	1
895421	1	20382	1839882	25	59502	1
895421	1	20382	1839882	25	59503	1
895421	1	20382	1839882	25	59504	1
895421	1	20382	1839882	25	59505	1
895421	1	20382	1839882	25	59506	1
895421	1	20382	1839882	25	59517	1
895421	1	20382	1839882	25	59518	1
895421	1	20382	1839882	25	59519	1
895421	1	20382	1839882	25	59520	1
895421	1	20382	1839882	25	59521	1
895421	1	20382	1839882	25	59522	1
895421	1	20382	1839882	25	59523	1
895421	1	20382	1839882	25	59525	1
895421	1	20382	1839882	25	59527	1
895421	1	20382	1839882	25	59528	1
895421	1	20382	1839882	25	59530	1
895421	1	20382	1839882	25	59531	1
895421	1	20382	1839882	25	59536	1
895421	1	20382	1839882	25	59537	1
895421	1	20382	1839882	25	59539	1
895421	1	20382	1839882	25	59540	1
895421	1	20382	1839882	25	59551	1
895421	1	20382	1839882	25	59552	1
895421	1	20382	1839882	25	59553	1
895421	1	20382	1839882	25	59554	1
895421	1	20382	1839882	25	59555	1
895421	1	20382	1839882	25	59557	1
895421	1	20382	1839882	25	59561	1
895421	1	20382	1839882	25	59562	1
895421	1	20382	1839882	25	59563	1
895421	1	20382	1839882	25	59565	1
895421	1	20382	1839882	25	59567	1
895421	1	20382	1839882	25	59569	1
895421	1	20382	1839882	25	59570	1
895421	1	20382	1839882	25	59574	1
895421	1	20382	1839882	25	59575	1
895421	1	20382	1839882	25	59580	1
895421	1	20382	1839882	25	59583	1
895421	1	20382	1839882	25	59585	1
895421	1	20382	1839882	25	59594	1
895421	1	20382	1839882	25	59597	1
895421	1	20382	1839882	25	59603	1
895421	1	20382	1839882	25	59607	1
895421	1	20382	1839882	25	59681	1
895421	1	20382	1839882	25	59682	1
895421	1	20382	1839882	25	59683	1
895421	1	20382	1839882	25	59685	1
895421	1	20382	1839882	25	59686	1
895421	1	20382	1839882	25	59687	1
895421	1	20382	1839882	25	59688	1
895421	1	20382	1839882	25	59689	1
895421	1	20382	1839882	25	59692	1
895421	1	20382	1839882	25	59696	1
895421	1	20382	1839882	25	59700	1
895421	2	20382	1839882	25	59322	1
895421	2	20382	1839882	25	59333	1
895421	2	20382	1839882	25	59335	1
895421	2	20382	1839882	25	59427	1
895421	2	20382	1839882	25	59452	1
895421	2	20382	1839882	25	59532	1
895421	2	20382	1839882	25	59697	1
895421	2	20382	1839882	25	59699	1
896159	9	20382	1193125	25	245172	1
896878	6	20382	1628280	25	45696	1
898293	7	20382	1969223	25	863	1
898293	7	20382	1969223	25	864	1
898293	6	20382	1225208	25	8702	1
898293	6	20382	1225208	25	8703	1
898293	6	20382	1225208	25	8704	1
898293	6	20382	1225208	25	8705	1
898293	6	20382	1225208	25	8706	1
898293	6	20382	1225208	25	8707	1
898293	6	20382	1225208	25	8708	1
898293	6	20382	1225208	25	8709	1
898293	6	20382	1225208	25	8710	1
898293	6	20382	1225208	25	8711	1
898293	6	20382	1225208	25	8713	1
898293	9	20382	1193125	25	244288	1
907471	9	20382	907471	25	102	1
908255	9	20382	1628280	25	45710	1
908311	9	20382	908311	25	90	1
9092	9	20382	1193125	25	244317	1
910073	58	20382	910073	25	160	1
910073	58	20382	910073	25	162	1
910073	58	20382	910073	25	163	1
910073	58	20382	910073	25	164	1
910073	58	20382	910073	25	165	1
910073	58	20382	910073	25	166	1
910073	19	20382	950142	25	2841	1
912463	103	20382	1193125	25	245045	1
912463	104	20382	1193125	25	245193	1
912593	6	20382	912593	25	252	1
914208	28	20382	1104659	25	101225	1
914775	22	20382	940400	25	4982	1
914775	22	20382	940400	25	4983	1
914775	22	20382	940400	25	4986	1
914775	22	20382	940400	25	4992	1
917251	12	20382	1104659	25	101233	1
917251	9	20382	1104659	25	101229	1
917851	80	20382	1292814	25	3579	1
917851	3	20382	1292814	25	3581	1
918965	13	20382	1040188	25	67	1
919567	6	20382	1437749	25	31395	1
920760	88	20382	1193125	25	245257	1
920760	88	20382	1193125	25	245379	1
92230	2	20382	1193125	25	243825	1
922869	27	20382	1193125	25	244829	1
922869	2	20382	1193125	25	244840	1
923202	5	20382	1193125	25	244346	1
923601	62	20382	1493152	25	18809	1
927628	9	20382	927628	25	267	1
927628	9	20382	927628	25	268	1
927971	1	20382	1214659	25	15129	1
927971	1	20382	1214659	25	15131	1
927971	1	20382	1214659	25	15133	1
927971	1	20382	1214659	25	15142	1
927971	1	20382	1214659	25	15144	1
927971	1	20382	1214659	25	15146	1
927971	1	20382	1214659	25	15148	1
927971	1	20382	1214659	25	15150	1
927971	1	20382	1214659	25	15157	1
927971	1	20382	1839882	25	59587	1
927971	1	20382	1839882	25	59604	1
927971	1	20382	1839882	25	59605	1
927971	1	20382	1839882	25	59606	1
927971	1	20382	1839882	25	59608	1
927971	1	20382	1839882	25	59611	1
927971	1	20382	1839882	25	59612	1
927971	1	20382	1839882	25	59613	1
927971	1	20382	1839882	25	59617	1
927971	1	20382	1839882	25	59620	1
927971	1	20382	1839882	25	59621	1
927971	1	20382	1839882	25	59622	1
927971	1	20382	1839882	25	59623	1
927971	1	20382	1839882	25	59624	1
927971	1	20382	1839882	25	59625	1
927971	2	20382	1214659	25	15152	1
927971	2	20382	1214659	25	15153	1
927971	2	20382	1214659	25	15155	1
927971	2	20382	1839882	25	59614	1
928568	4	20382	928568	25	5	1
930157	3	20382	1654954	25	11997	1
9326	12	20382	9326	25	22	1
9326	9	20382	9326	25	19	1
93556	8	20382	1628280	25	45594	1
935679	6	20382	1193125	25	245089	1
935703	6	20382	935703	25	87	1
936468	12	20382	1628280	25	45693	1
936468	9	20382	1628280	25	45582	1
936941	4	20382	936941	25	13	1
93751	24	20382	1193125	25	245202	1
941568	32	20382	1104659	25	101274	1
945394	9	20382	945394	25	87	1
946770	6	20382	1140361	25	38812	1
947263	1	20382	1140361	25	38687	1
947263	1	20382	1140361	25	38689	1
947263	1	20382	1140361	25	38697	1
947263	1	20382	1140361	25	38760	1
947263	1	20382	1140361	25	38762	1
947263	1	20382	1140361	25	38765	1
947263	1	20382	1140361	25	38773	1
947263	1	20382	1140361	25	38775	1
947263	1	20382	1140361	25	38777	1
947263	1	20382	1140361	25	38781	1
947263	1	20382	1140361	25	38783	1
947263	1	20382	1140361	25	38786	1
947263	1	20382	1140361	25	38789	1
947263	1	20382	1140361	25	38790	1
947263	1	20382	1140361	25	38793	1
947263	1	20382	1140361	25	38795	1
947263	1	20382	1140361	25	38797	1
947263	1	20382	1140361	25	38800	1
947263	1	20382	1140361	25	38801	1
947263	2	20382	1140361	25	38814	1
947996	4	20382	894189	25	11572	1
949858	8	20382	1193125	25	245268	1
9521	6	20382	1185533	25	5	1
96223	1	20382	1140361	25	38825	1
96223	1	20382	1140361	25	38827	1
96223	1	20382	1140361	25	38831	1
96223	1	20382	1140361	25	38833	1
96223	1	20382	1140361	25	38837	1
96223	1	20382	1140361	25	38841	1
96223	1	20382	1140361	25	38844	1
96223	6	20382	1214659	25	15174	1
96223	6	20382	1214659	25	15175	1
9631	1	20382	1839882	25	59321	1
9631	1	20382	1839882	25	59366	1
9631	1	20382	1839882	25	59374	1
9631	1	20382	1839882	25	59375	1
9631	1	20382	1839882	25	59400	1
9631	1	20382	1839882	25	59403	1
9631	1	20382	1839882	25	59411	1
9631	1	20382	1839882	25	59413	1
9631	1	20382	1839882	25	59445	1
9631	1	20382	1839882	25	59541	1
9631	1	20382	1839882	25	59619	1
9631	1	20382	1839882	25	59702	1
9631	2	20382	1839882	25	59329	1
9631	2	20382	1839882	25	59330	1
9713	5	20382	1628280	25	45687	1
9713	5	20382	1628280	25	45688	1
97216	6	20382	1488168	25	3	1
97216	9	20382	97216	25	151	1
\.

-- Update sequences
SELECT setval('sec_form_types_id_seq', (SELECT MAX(id) FROM sec_form_types));
SELECT setval('sec_file_extensions_id_seq', (SELECT MAX(id) FROM sec_file_extensions));
