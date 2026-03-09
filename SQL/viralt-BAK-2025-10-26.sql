--
-- PostgreSQL database dump
--

\restrict aI3jwJ5GILsCRYHcfXad3mOYSZPD6asK3KMg2qqnSjZbNqpA6EdG9SCFCJxs7aZ

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-10-21 17:42:27

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4508 (class 0 OID 16510)
-- Dependencies: 226
-- Data for Name: campaign_entries; Type: TABLE DATA; Schema: public; Owner: doadmin
--



--
-- TOC entry 4510 (class 0 OID 16528)
-- Dependencies: 228
-- Data for Name: campaign_entry_options; Type: TABLE DATA; Schema: public; Owner: doadmin
--



--
-- TOC entry 4506 (class 0 OID 16498)
-- Dependencies: 224
-- Data for Name: campaign_field_options; Type: TABLE DATA; Schema: public; Owner: doadmin
--



--
-- TOC entry 4504 (class 0 OID 16484)
-- Dependencies: 222
-- Data for Name: campaign_fields; Type: TABLE DATA; Schema: public; Owner: doadmin
--



--
-- TOC entry 4502 (class 0 OID 16465)
-- Dependencies: 220
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: doadmin
--



--
-- TOC entry 4514 (class 0 OID 16554)
-- Dependencies: 232
-- Data for Name: client_entries; Type: TABLE DATA; Schema: public; Owner: doadmin
--



--
-- TOC entry 4512 (class 0 OID 16540)
-- Dependencies: 230
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: doadmin
--



--
-- TOC entry 4500 (class 0 OID 16455)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: doadmin
--



--
-- TOC entry 4529 (class 0 OID 0)
-- Dependencies: 225
-- Name: campaign_entries_entry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: doadmin
--

SELECT pg_catalog.setval('public.campaign_entries_entry_id_seq', 1, false);


--
-- TOC entry 4530 (class 0 OID 0)
-- Dependencies: 227
-- Name: campaign_entry_options_option_id_seq; Type: SEQUENCE SET; Schema: public; Owner: doadmin
--

SELECT pg_catalog.setval('public.campaign_entry_options_option_id_seq', 1, false);


--
-- TOC entry 4531 (class 0 OID 0)
-- Dependencies: 223
-- Name: campaign_field_options_option_id_seq; Type: SEQUENCE SET; Schema: public; Owner: doadmin
--

SELECT pg_catalog.setval('public.campaign_field_options_option_id_seq', 1, false);


--
-- TOC entry 4532 (class 0 OID 0)
-- Dependencies: 221
-- Name: campaign_fields_field_id_seq; Type: SEQUENCE SET; Schema: public; Owner: doadmin
--

SELECT pg_catalog.setval('public.campaign_fields_field_id_seq', 1, false);


--
-- TOC entry 4533 (class 0 OID 0)
-- Dependencies: 219
-- Name: campaigns_campaign_id_seq; Type: SEQUENCE SET; Schema: public; Owner: doadmin
--

SELECT pg_catalog.setval('public.campaigns_campaign_id_seq', 1, false);


--
-- TOC entry 4534 (class 0 OID 0)
-- Dependencies: 231
-- Name: client_entries_client_entry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: doadmin
--

SELECT pg_catalog.setval('public.client_entries_client_entry_id_seq', 1, false);


--
-- TOC entry 4535 (class 0 OID 0)
-- Dependencies: 229
-- Name: clients_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: doadmin
--

SELECT pg_catalog.setval('public.clients_client_id_seq', 1, false);


--
-- TOC entry 4536 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: doadmin
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, false);


-- Completed on 2025-10-21 17:42:51

--
-- PostgreSQL database dump complete
--

\unrestrict aI3jwJ5GILsCRYHcfXad3mOYSZPD6asK3KMg2qqnSjZbNqpA6EdG9SCFCJxs7aZ

