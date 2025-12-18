--
-- PostgreSQL database dump
--

\restrict PR6U6yN9b9NNsCneCkYylbrgNR37Bt6CzI0FcQvtrTTbibVQJ3xF7wXiFRwpetG

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg12+2)
-- Dumped by pg_dump version 18.1 (Ubuntu 18.1-1.pgdg24.04+2)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: radha
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO radha;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.attendance (
    id bigint NOT NULL,
    date date NOT NULL,
    employee_id bigint,
    status text NOT NULL,
    custom_salary numeric
);


ALTER TABLE public.attendance OWNER TO radha;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.customers (
    id bigint NOT NULL,
    name text NOT NULL,
    mobile text,
    place text
);


ALTER TABLE public.customers OWNER TO radha;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.employees (
    id bigint NOT NULL,
    name text NOT NULL,
    salary_type text,
    daily_salary numeric,
    active boolean DEFAULT true,
    mobile text,
    area text
);


ALTER TABLE public.employees OWNER TO radha;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.expenses (
    id bigint NOT NULL,
    date date NOT NULL,
    amount numeric NOT NULL,
    category text,
    material_name text,
    unit text,
    quantity numeric,
    notes text
);


ALTER TABLE public.expenses OWNER TO radha;

--
-- Name: farm_crops; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.farm_crops (
    id bigint NOT NULL,
    crop_name text NOT NULL,
    crop_type text NOT NULL,
    acres_used numeric NOT NULL,
    time_duration integer NOT NULL,
    duration_unit text DEFAULT 'days'::text,
    starting_date date NOT NULL,
    estimated_ending_date date NOT NULL,
    auto_calculate_end_date boolean DEFAULT true,
    actual_end_date date,
    crop_status text DEFAULT 'active'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.farm_crops OWNER TO radha;

--
-- Name: farm_expense_categories; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.farm_expense_categories (
    id bigint NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.farm_expense_categories OWNER TO radha;

--
-- Name: farm_expense_subcategories; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.farm_expense_subcategories (
    id bigint NOT NULL,
    category_id bigint,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.farm_expense_subcategories OWNER TO radha;

--
-- Name: farm_expenses; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.farm_expenses (
    id bigint NOT NULL,
    date date NOT NULL,
    crop_id bigint,
    category_id bigint,
    subcategory_id bigint,
    unit text,
    quantity numeric,
    amount numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    male_count integer,
    female_count integer,
    notes text,
    total_food text
);


ALTER TABLE public.farm_expenses OWNER TO radha;

--
-- Name: farm_income; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.farm_income (
    id bigint NOT NULL,
    date date NOT NULL,
    crop_id bigint,
    description text,
    amount numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.farm_income OWNER TO radha;

--
-- Name: farm_timeline; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.farm_timeline (
    id bigint NOT NULL,
    crop_id bigint,
    date date NOT NULL,
    task text NOT NULL,
    notes text,
    due_date date NOT NULL,
    status text DEFAULT 'todo'::text,
    created_at timestamp without time zone DEFAULT now(),
    priority text DEFAULT 'medium'::text,
    done_date date
);


ALTER TABLE public.farm_timeline OWNER TO radha;

--
-- Name: home_expense_items; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.home_expense_items (
    id bigint NOT NULL,
    category text NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    type text DEFAULT 'expense'::text
);


ALTER TABLE public.home_expense_items OWNER TO radha;

--
-- Name: home_expenses; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.home_expenses (
    id bigint NOT NULL,
    date date NOT NULL,
    description text,
    amount numeric NOT NULL,
    category text DEFAULT 'Other'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.home_expenses OWNER TO radha;

--
-- Name: home_income; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.home_income (
    id bigint NOT NULL,
    date date NOT NULL,
    description text,
    amount numeric NOT NULL,
    category text DEFAULT 'Salary'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.home_income OWNER TO radha;

--
-- Name: home_loan_transactions; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.home_loan_transactions (
    id bigint NOT NULL,
    loan_id bigint,
    date date NOT NULL,
    amount numeric NOT NULL,
    type text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    interest_component numeric(15,2) DEFAULT 0
);


ALTER TABLE public.home_loan_transactions OWNER TO radha;

--
-- Name: home_loans; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.home_loans (
    id bigint NOT NULL,
    name text NOT NULL,
    loan_type text NOT NULL,
    principal_amount numeric NOT NULL,
    current_balance numeric NOT NULL,
    interest_rate numeric NOT NULL,
    start_date date NOT NULL,
    status text DEFAULT 'active'::text,
    created_at timestamp without time zone DEFAULT now(),
    emi_amount numeric DEFAULT 0,
    due_date integer,
    closing_date date,
    account_number text,
    tenure_months integer,
    end_date date
);


ALTER TABLE public.home_loans OWNER TO radha;

--
-- Name: home_savings; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.home_savings (
    id bigint NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    amount numeric NOT NULL,
    start_date date,
    end_date date,
    duration text,
    interest_rate numeric,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    grams numeric,
    rate numeric,
    target_amount numeric,
    symbol text
);


ALTER TABLE public.home_savings OWNER TO radha;

--
-- Name: home_savings_transactions; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.home_savings_transactions (
    id bigint NOT NULL,
    saving_id bigint,
    date date NOT NULL,
    amount numeric NOT NULL,
    type text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    grams numeric,
    rate numeric,
    employee_share numeric,
    employer_share numeric
);


ALTER TABLE public.home_savings_transactions OWNER TO radha;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    booking_date date NOT NULL,
    due_date date NOT NULL,
    customer_id bigint,
    status text DEFAULT 'waiting'::text,
    discount numeric DEFAULT 0,
    total numeric NOT NULL,
    payment_status text DEFAULT 'paid'::text,
    amount_received numeric DEFAULT 0,
    items jsonb NOT NULL
);


ALTER TABLE public.orders OWNER TO radha;

--
-- Name: previous_month_item_stock; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.previous_month_item_stock (
    id bigint NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    item_name text NOT NULL,
    quantity numeric NOT NULL,
    unit text DEFAULT 'kg'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.previous_month_item_stock OWNER TO radha;

--
-- Name: previous_month_raw_material_stock; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.previous_month_raw_material_stock (
    id bigint NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    material_name text NOT NULL,
    quantity numeric NOT NULL,
    unit text DEFAULT 'kg'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.previous_month_raw_material_stock OWNER TO radha;

--
-- Name: production; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.production (
    id bigint NOT NULL,
    date date NOT NULL,
    item text NOT NULL,
    qty numeric NOT NULL,
    unit text DEFAULT 'kg'::text NOT NULL,
    batch_number text,
    packed_qty numeric DEFAULT 0
);


ALTER TABLE public.production OWNER TO radha;

--
-- Name: products; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(100),
    unit character varying(20) DEFAULT 'kg'::character varying,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.products OWNER TO radha;

--
-- Name: raw_material_prices; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.raw_material_prices (
    id bigint NOT NULL,
    name text NOT NULL,
    unit text NOT NULL,
    price_per_unit numeric NOT NULL
);


ALTER TABLE public.raw_material_prices OWNER TO radha;

--
-- Name: raw_material_purchases; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.raw_material_purchases (
    id bigint NOT NULL,
    date date NOT NULL,
    material_name text NOT NULL,
    qty numeric NOT NULL,
    cost numeric NOT NULL
);


ALTER TABLE public.raw_material_purchases OWNER TO radha;

--
-- Name: raw_material_usage; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.raw_material_usage (
    id bigint NOT NULL,
    date date NOT NULL,
    material_name text NOT NULL,
    quantity_used numeric NOT NULL,
    unit text NOT NULL,
    notes text,
    cost numeric DEFAULT 0
);


ALTER TABLE public.raw_material_usage OWNER TO radha;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.sales (
    id bigint NOT NULL,
    date date NOT NULL,
    customer_id bigint,
    discount numeric DEFAULT 0,
    total numeric NOT NULL,
    payment_status text DEFAULT 'paid'::text,
    amount_received numeric DEFAULT 0,
    items jsonb NOT NULL,
    buy_type text DEFAULT 'regular'::text
);


ALTER TABLE public.sales OWNER TO radha;

--
-- Name: stocks; Type: TABLE; Schema: public; Owner: radha
--

CREATE TABLE public.stocks (
    type text NOT NULL,
    name text NOT NULL,
    qty numeric DEFAULT 0,
    unit text DEFAULT 'kg'::text
);


ALTER TABLE public.stocks OWNER TO radha;

--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.attendance (id, date, employee_id, status, custom_salary) FROM stdin;
1765783638522	2025-11-15	1764591857369	holiday	\N
1765783607444	2025-11-15	1765782690000	holiday	\N
1765784059817	2025-11-14	1764574621340	holiday	\N
1765784061922	2025-11-14	1764574636932	holiday	\N
1765784062785	2025-11-14	1764574595612	holiday	\N
1765784063602	2025-11-14	1764588715221	holiday	\N
1765784064326	2025-11-14	1764591857369	holiday	\N
1764588762637	2025-12-01	1764574636932	absent	\N
1765784064977	2025-11-14	1765782690000	absent	\N
1765843655851	2025-12-16	1764574595612	present	\N
1765843714103	2025-12-15	1764591857369	absent	\N
1765781851332	2025-12-15	1764574621340	present	\N
1764591862428	2025-12-01	1764591857369	absent	\N
1765901356562	2025-12-16	1764574636932	present	\N
1765901357087	2025-12-16	1764574621340	present	\N
1764588632536	2025-12-01	1764574621340	present	250
1765901357745	2025-12-16	1764588715221	present	\N
1764588776890	2025-12-01	1764574595612	present	250
1764596979179	2025-12-01	1764588715221	present	250
1764589127696	2025-12-02	1764574621340	present	\N
1764588821118	2025-12-02	1764574595612	present	\N
1764691907714	2025-12-02	1764588715221	present	\N
1764762998054	2025-12-03	1764574621340	present	\N
1764763001487	2025-12-03	1764574595612	present	\N
1764763002875	2025-12-03	1764588715221	present	\N
1764861347378	2025-12-04	1764574621340	present	\N
1764861350236	2025-12-04	1764574595612	present	\N
1764861352800	2025-12-04	1764588715221	present	\N
1764951145573	2025-12-05	1764574595612	present	\N
1764951148598	2025-12-05	1764574621340	present	\N
1764951151364	2025-12-05	1764588715221	present	\N
1765208955334	2025-12-08	1764588715221	present	\N
1765208957699	2025-12-08	1764574621340	present	\N
1765381720543	2025-12-09	1764574621340	present	\N
1765381721432	2025-12-09	1764574636932	present	\N
1765381722038	2025-12-09	1764574595612	present	\N
1765381722624	2025-12-09	1764588715221	present	\N
1765381727670	2025-12-10	1764574621340	present	\N
1765381728124	2025-12-10	1764574636932	present	\N
1765381728807	2025-12-10	1764588715221	present	\N
1765381728489	2025-12-10	1764574595612	present	\N
1765765030844	2025-12-14	1764588715221	present	\N
1765765036747	2025-12-13	1764574621340	present	\N
1765765037392	2025-12-13	1764574636932	present	\N
1765765037812	2025-12-13	1764574595612	present	\N
1765765038306	2025-12-13	1764588715221	present	\N
1765765059691	2025-12-12	1764574595612	present	\N
1765765059222	2025-12-12	1764574636932	present	\N
1765765060129	2025-12-12	1764588715221	present	\N
1765765030362	2025-12-14	1764574595612	present	\N
1765765029441	2025-12-14	1764574636932	present	\N
1765765028789	2025-12-14	1764574621340	present	\N
1765073635496	2025-12-06	1764588715221	holiday	\N
1765782061576	2025-12-06	1764574636932	holiday	\N
1765782061577	2025-12-06	1764591857369	holiday	\N
1765073634163	2025-12-06	1764574595612	holiday	\N
1765073631754	2025-12-06	1764574621340	present	\N
1765782476232	2025-12-15	1764574595612	present	\N
1765782323592	2025-12-15	1764574636932	present	\N
1765783108738	2025-12-15	1765782690000	absent	\N
1765783408388	2025-12-15	1764588715221	present	\N
1765783434666	2025-12-11	1764574621340	holiday	\N
1765783434667	2025-12-11	1764574595612	holiday	\N
1765783434668	2025-12-11	1765782690000	holiday	\N
1765784038172	2025-11-15	1764574621340	holiday	\N
1765783607442	2025-11-15	1764574636932	holiday	\N
1765784040905	2025-11-15	1764574595612	holiday	\N
1765783607443	2025-11-15	1764588715221	holiday	\N
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.customers (id, name, mobile, place) FROM stdin;
1764578278012	RKS	\N	\N
1764589897034	Anandh	\N	\N
1764596744539	P.S	\N	\N
1764597470015	Majith	\N	\N
1764597494613	Ushan	\N	\N
1764597505842	Pakkam 	\N	\N
1764597520779	Madukarai	\N	\N
1764597539141	Villiyanur	\N	\N
1764597558497	Sendhura	\N	\N
1764765681884	Local	\N	\N
1765075044951	Gift	\N	\N
1765789350047	test	\N	\N
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.employees (id, name, salary_type, daily_salary, active, mobile, area) FROM stdin;
1764574636932	PottuAmma	daily	250	t	\N	\N
1764574621340	Nadhiya	daily	250	t	\N	\N
1764574595612	Saranaya	daily	250	t	413431532	\N
1764588715221	Subbu	daily	250	t	\N	\N
1764591857369	test	daily	250	t	\N	\N
1765782690000	Test Employee	daily	300	t	1234567890	Test Area
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.expenses (id, date, amount, category, material_name, unit, quantity, notes) FROM stdin;
1764582365838	2025-12-01	0	Raw Material	பொட்டு கடலை	kg	30	
1764604782256	2025-12-01	0	Raw Material	வெல்லம்	kg	18	
1764604920117	2025-12-01	0	Raw Material	மிளகாய் தூள்	kg	0.9	
1764605134334	2025-12-01	0	Raw Material	மிளகாய் தூள்	kg	0.9	
1764605241349	2025-12-01	0	Raw Material	மிளகு	kg	0.15	
1764605273617	2025-12-01	0	Raw Material	சீரகம்	kg	1.2	
1764763921956	2025-12-01	450	Raw Material	மிளகு	kg	0.5	
1764763942754	2025-12-03	350	Raw Material	ஏலக்காய் 	kg	0.1	
1764764071486	2025-12-03	826	Raw Material	எண்ணைய் 	lt	7	
1764764112037	2025-12-03	950	Raw Material	எரிவாயுவு 	count	1	
1764574348283	2025-12-01	4720	Raw Material	எண்ணைய் 	lt	40	
1764582278510	2025-12-01	0	Raw Material	அரிசி மாவு 	kg	141	
1764605100272	2025-12-01	0	Raw Material	பச்சை அரிசி 	kg	140	
1764765115041	2025-12-03	160	Other	\N	\N	\N	Rice mill
1764773720589	2025-12-01	0	Raw Material	எள்ளு 	kg	4.15	
1764773854539	2025-12-01	0	Raw Material	பொருசிரவம் 	kg	1.2	
1764582188802	2025-12-01	0	Raw Material	எரிவாயுவு 	count	3	
1764861382638	2025-12-04	500	Raw Material	மைதா மாவு 	kg	10	
1764861495801	2025-12-04	60	Raw Material	முட்டை 	count	10	
1764861544255	2025-12-04	500	Raw Material	சக்கரை 	kg	10	
1764861763609	2025-12-04	100	Other	\N	\N	\N	Rice mill 
1764998809191	2025-12-06	10	Raw Material	கருவேப்பிலை 	₹	\N	
1765157420129	2025-12-07	1500	Raw Material	கடலை	kg	10	
1764861630790	2025-12-04	4400	Raw Material	எண்ணைய் 	lt	30	
1765208984667	2025-12-08	10	Other	\N	\N	\N	
1765382174243	2025-12-09	6000	Raw Material	அரிசி மாவு 	kg	2	
1765382214559	2025-12-09	4100	Raw Material	எண்ணைய் 	lt	30	2 Din 
1765382295230	2025-12-09	2250	Raw Material	பொட்டு கடலை	kg	30	1950+300(rice mill)
1765382356676	2025-12-09	100	Other	\N	\N	\N	Rice mill * 10
1765382396879	2025-12-10	3060	Raw Material	எரிவாயுவு 	count	3	
1765415527988	2025-12-10	400	Raw Material	Box	count	100	
1765625513265	2025-12-12	150	Other	\N	\N	\N	Rice mill 15 kg
1765625536579	2025-12-12	950	Raw Material	எரிவாயுவு 	count	1	
1765625563154	2025-12-13	100	Other	\N	\N	\N	Rice mill 10 kg
1765625585418	2025-12-13	4000	Raw Material	எண்ணைய் 	lt	30	2 din
1765814511343	2025-12-15	90	Raw Material	ரவை	kg	2	
1765814534728	2025-12-15	90	Raw Material	சக்கரை 	kg	2	
1765814555385	2025-12-15	100	Raw Material	மைதா மாவு 	kg	2	
1765901231068	2025-12-16	1620	Raw Material	உளுந்து 	kg	15	
1765901248632	2025-12-16	2000	Raw Material	எண்ணைய் 	lt	15	
\.


--
-- Data for Name: farm_crops; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.farm_crops (id, crop_name, crop_type, acres_used, time_duration, duration_unit, starting_date, estimated_ending_date, auto_calculate_end_date, actual_end_date, crop_status, created_at) FROM stdin;
1765854056062	நெல் 	தானியம் 	1.5	4	months	2025-10-08	2026-02-08	t	\N	active	2025-12-16 03:00:55.456267
\.


--
-- Data for Name: farm_expense_categories; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.farm_expense_categories (id, name, created_at) FROM stdin;
1765185320249	Tillage	2025-12-08 09:15:20.178144
1765185320250	Seeds or Plant	2025-12-08 09:15:20.449325
1765185320251	Workers	2025-12-08 09:15:20.788236
1765185320252	Fertilizer	2025-12-08 09:15:21.114266
1765185320253	Maintenance Work	2025-12-08 09:15:21.407208
1765439252820	Food	2025-12-11 07:47:34.556916
\.


--
-- Data for Name: farm_expense_subcategories; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.farm_expense_subcategories (id, category_id, name, created_at) FROM stdin;
1765185322203	1765185320249	Cow	2025-12-08 09:15:22.034296
1765185322485	1765185320249	Tractor	2025-12-08 09:15:22.359601
1765190474478	1765185320252	Uria	2025-12-08 10:41:14.624385
1765191000019	1765185320251	Male	2025-12-08 10:50:01.759337
1765191011208	1765185320251	Female	2025-12-08 10:50:11.35539
\.


--
-- Data for Name: farm_expenses; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.farm_expenses (id, date, crop_id, category_id, subcategory_id, unit, quantity, amount, created_at, male_count, female_count, notes, total_food) FROM stdin;
1765854167652	2025-10-31	1765854056062	1765185320251	\N	\N	\N	1400	2025-12-16 03:02:46.988759	4	\N	அண்டை 4 ஆள் 	\N
1765854284052	2025-11-01	1765854056062	1765185320249	1765185322485	acres	1.5	3500	2025-12-16 03:04:43.509741	\N	\N	உழவு	\N
1765854339224	2025-10-31	1765854056062	1765185320249	1765185322203	acres	1.5	1200	2025-12-16 03:05:37.862572	\N	\N	பரம்பு	\N
\.


--
-- Data for Name: farm_income; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.farm_income (id, date, crop_id, description, amount, created_at) FROM stdin;
\.


--
-- Data for Name: farm_timeline; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.farm_timeline (id, crop_id, date, task, notes, due_date, status, created_at, priority, done_date) FROM stdin;
\.


--
-- Data for Name: home_expense_items; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.home_expense_items (id, category, name, created_at, type) FROM stdin;
1765793879113	Loans & EMIs	Bank Loan EMI	2025-12-15 10:16:28.675274	expense
1765793872758	Loans & EMIs	Private Finance EMI	2025-12-15 10:16:28.893158	expense
1765793837111	Loans & EMIs	Credit / Personal Loan	2025-12-15 10:16:29.216963	expense
1765793855090	Loans & EMIs	Other EMIs	2025-12-15 10:16:29.429192	expense
1765793875429	Utilities & Bills	Milk	2025-12-15 10:16:29.641444	expense
1765793881808	Utilities & Bills	TV Cable	2025-12-15 10:16:29.861468	expense
1765793799711	Utilities & Bills	Internet / WiFi	2025-12-15 10:16:30.078928	expense
1765793829948	Utilities & Bills	Electricity Bill (EB)	2025-12-15 10:16:30.293757	expense
1765793796753	Utilities & Bills	Gas Cylinder	2025-12-15 10:16:30.506534	expense
1765793803161	Transportation	Petrol – TVS XL	2025-12-15 10:16:30.723434	expense
1765793842788	Transportation	Petrol – TVS Ntorq	2025-12-15 10:16:30.941752	expense
1765793821972	Transportation	Petrol – Passion Pro	2025-12-15 10:16:31.157132	expense
1765793839192	Transportation	Public Transport	2025-12-15 10:16:31.372545	expense
1765793875610	Maintenance	Bike Service	2025-12-15 10:16:31.593752	expense
1765793832263	Maintenance	Home Maintenance	2025-12-15 10:16:31.839215	expense
1765793844486	Maintenance	Repairs	2025-12-15 10:16:32.068067	expense
1765793879951	Maintenance	Accessories / Spare Parts	2025-12-15 10:16:32.359727	expense
1765793811479	Food (Home)	Vegetables	2025-12-15 10:16:32.573294	expense
1765793847242	Food (Home)	Fruits	2025-12-15 10:16:32.799746	expense
1765793851327	Food (Home)	Fish	2025-12-15 10:16:33.01898	expense
1765793802329	Food (Home)	Chicken	2025-12-15 10:16:33.23843	expense
1765793837657	Food (Home)	Prawn	2025-12-15 10:16:33.456323	expense
1765793818957	Food (Home)	Other Non-Veg	2025-12-15 10:16:33.671095	expense
1765793883819	Food (Outside)	Fast Food	2025-12-15 10:16:33.893226	expense
1765793869339	Food (Outside)	Fried Rice	2025-12-15 10:16:34.108271	expense
1765793821325	Food (Outside)	Parotta	2025-12-15 10:16:34.349044	expense
1765793816011	Food (Outside)	Biryani	2025-12-15 10:16:34.564745	expense
1765793850603	Food (Outside)	Pizza	2025-12-15 10:16:34.783488	expense
1765793842362	Food (Outside)	Street Food	2025-12-15 10:16:35.004958	expense
1765793885754	Food (Outside)	Pani Puri	2025-12-15 10:16:35.220748	expense
1765793837176	Food (Outside)	Bajji	2025-12-15 10:16:35.463194	expense
1765793829720	Food (Outside)	Bonda	2025-12-15 10:16:35.7198	expense
1765793824175	Food (Outside)	Snacks (Packed Items)	2025-12-15 10:16:35.976112	expense
1765793883808	Shopping & Lifestyle	Dress / Clothing	2025-12-15 10:16:36.191839	expense
1765793858599	Shopping & Lifestyle	Online Shopping	2025-12-15 10:16:36.4051	expense
1765793882516	Shopping & Lifestyle	General Shopping	2025-12-15 10:16:36.618148	expense
1765793815093	Shopping & Lifestyle	Function Expenses	2025-12-15 10:16:36.835008	expense
1765793874355	Shopping & Lifestyle	Outing / Entertainment	2025-12-15 10:16:37.049226	expense
1765793805764	Health & Medical	Medicines	2025-12-15 10:16:37.260234	expense
1765793893921	Health & Medical	Doctor Consultation	2025-12-15 10:16:37.473776	expense
1765793840070	Health & Medical	Hospital Charges	2025-12-15 10:16:37.716001	expense
1765793832512	Health & Medical	Emergency Medical	2025-12-15 10:16:37.931004	expense
1765793840521	Emergency	Medical Emergency	2025-12-15 10:16:38.147806	expense
1765793883341	Emergency	Repair Emergency	2025-12-15 10:16:38.382542	expense
1765793834107	Emergency	Family Emergency	2025-12-15 10:16:38.659147	expense
1765793897298	Emergency	Other Emergency	2025-12-15 10:16:38.873892	expense
1765793847963	Others	Miscellaneous	2025-12-15 10:16:39.088024	expense
1765793841553	Others	Unknown Expense	2025-12-15 10:16:39.310774	expense
1765793821224	Others	Future Category	2025-12-15 10:16:39.52878	expense
1765793949575	Loans & EMIs	Indian Bank	2025-12-15 10:19:10.931381	expense
1765794112622	Loans & EMIs	UCO Bank	2025-12-15 10:21:54.023827	expense
1765794846173	Salary	Radha	2025-12-15 10:34:07.806531	expense
1765794971463	Salary	Monthly Salary	2025-12-15 10:34:54.975028	income
1765794904421	Business	Business Profit	2025-12-15 10:34:55.194498	income
1765794991013	Rent	House Rent	2025-12-15 10:34:55.409426	income
1765794907685	Interest	Bank Interest	2025-12-15 10:34:55.622427	income
1765794971675	Gift	Cash Gift	2025-12-15 10:34:55.837242	income
1765795317847	Salary	Radha	2025-12-15 10:41:59.211739	income
1765846487400	Loans & EMIs	bank	2025-12-16 00:53:51.074622	expense
1765846530624	Salary	rk	2025-12-16 00:54:34.886079	income
1765931163755	Groceries	Kitchen	2025-12-17 00:26:04.354077	expense
1765931169823	Groceries	Bathroom	2025-12-17 00:26:10.017111	expense
1765932010646	Food (Home)	EGG	2025-12-17 00:40:11.043765	expense
1765932242232	Food (Outside)	Juice	2025-12-17 00:44:02.59195	expense
\.


--
-- Data for Name: home_expenses; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.home_expenses (id, date, description, amount, category, created_at) FROM stdin;
1765931077968	2025-12-03	Petrol – TVS Ntorq	200	Transportation	2025-12-17 00:24:38.73848
1765931224201	2025-12-03	Bathroom	345	Groceries	2025-12-17 00:27:04.643169
1765931203729	2025-12-03	Kitchen	60	Groceries	2025-12-17 00:26:44.095915
1765931414589	2025-12-04	Petrol – TVS XL	400	Transportation	2025-12-17 00:30:24.890412
1765931481325	2025-12-05	Snacks (Packed Items)	100	Food (Outside)	2025-12-17 00:31:22.122001
1765931579858	2025-12-05	Petrol – TVS Ntorq	200	Transportation	2025-12-17 00:33:00.993223
1765931617022	2025-12-05	Medicines	120	Health & Medical	2025-12-17 00:33:37.502347
1765931645853	2025-12-05	Vegetables	100	Food (Home)	2025-12-17 00:34:06.399628
1765931671299	2025-12-06	Street Food	100	Food (Outside)	2025-12-17 00:34:31.748595
1765931707681	2025-12-06	Outing / Entertainment	400	Shopping & Lifestyle	2025-12-17 00:35:08.160009
1765931728625	2025-12-06	Fish	300	Food (Home)	2025-12-17 00:35:29.676623
1765931748701	2025-12-07	Pani Puri	120	Food (Outside)	2025-12-17 00:35:49.153396
1765931772938	2025-12-07	Petrol – TVS XL	300	Transportation	2025-12-17 00:36:13.331562
1765931822351	2025-12-07	Rose plant	120	Others	2025-12-17 00:37:02.938871
1765931843315	2025-12-08	Petrol – TVS Ntorq	200	Transportation	2025-12-17 00:37:23.9145
1765931858779	2025-12-09	Fish	400	Food (Home)	2025-12-17 00:37:39.23278
1765931904562	2025-12-09	Fertilizer for coconut tree 	500	Others	2025-12-17 00:38:24.930325
1765931962109	2025-12-10	Bike Service Xl	2025	Maintenance	2025-12-17 00:39:23.046549
1765932026500	2025-12-10	EGG	200	Food (Home)	2025-12-17 00:40:27.427833
1765932054021	2025-12-10	Petrol – TVS Ntorq	200	Transportation	2025-12-17 00:40:54.326645
1765932069830	2025-12-12	Petrol – TVS Ntorq	200	Transportation	2025-12-17 00:41:10.107145
1765932122610	2025-12-12	Ntrq puncher 	150	Maintenance	2025-12-17 00:42:03.014803
1765932156145	2025-12-13	Fast Food	30	Food (Outside)	2025-12-17 00:42:36.46211
1765932191649	2025-12-13	Petrol – TVS XL	200	Transportation	2025-12-17 00:43:12.514066
1765932266775	2025-12-13	Juice	30	Food (Outside)	2025-12-17 00:44:27.564743
1765932303141	2025-12-13	Ntrq tiet	1800	Maintenance	2025-12-17 00:45:03.408284
1765932353477	2025-12-13	Chicken	100	Food (Home)	2025-12-17 00:45:53.818769
1765932408596	2025-12-14	Milk	80	Utilities & Bills	2025-12-17 00:46:49.385367
1765932440931	2025-12-14	Chappathi 	90	Food (Outside)	2025-12-17 00:47:21.149483
1765932466595	2025-12-15	Petrol – TVS Ntorq	200	Transportation	2025-12-17 00:47:46.953528
1765932483625	2025-12-15	Petrol – TVS XL	300	Transportation	2025-12-17 00:48:04.281031
1765932520876	2025-12-16	Fish	50	Food (Home)	2025-12-17 00:48:41.173879
1765932536682	2025-12-16	Snacks (Packed Items)	50	Food (Outside)	2025-12-17 00:48:57.059179
1765932551052	2025-12-16	Kitchen	180	Groceries	2025-12-17 00:49:11.366982
\.


--
-- Data for Name: home_income; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.home_income (id, date, description, amount, category, created_at) FROM stdin;
1765932599186	2025-12-01	Radha	22400	Salary	2025-12-17 00:49:59.696294
\.


--
-- Data for Name: home_loan_transactions; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.home_loan_transactions (id, loan_id, date, amount, type, description, created_at, interest_component) FROM stdin;
1766039224625	1766039172707	2025-05-10	6334	payment	Payment	2025-12-18 06:27:06.413999	6334.00
1766039249432	1766039172707	2025-06-10	22401	payment	Payment	2025-12-18 06:27:31.405842	18720.00
1766039322285	1766039172707	2025-08-10	22401	payment	Payment	2025-12-18 06:28:43.709744	18604.26
1766039346199	1766039172707	2025-09-10	22401	payment	Payment	2025-12-18 06:29:07.770081	18545.03
1766039366791	1766039172707	2025-07-10	22401	payment	Payment	2025-12-18 06:29:28.291465	18484.87
1766039402686	1766039172707	2025-10-10	22401	payment	Payment	2025-12-18 06:30:04.405645	18423.78
1766039430423	1766039172707	2025-11-10	22401	payment	Payment	2025-12-18 06:30:32.000005	18361.74
1766039458866	1766039172707	2025-12-10	22401	payment	Payment	2025-12-18 06:31:00.415613	18298.73
1766044229402	1766044066975	2024-09-05	45000	payment	from aug/24 to dec/25	2025-12-18 07:50:31.142572	45000.00
1766044396527	1766044353769	2025-12-18	33000	payment	from Feb/25 to Dec/25	2025-12-18 07:53:18.461529	33000.00
\.


--
-- Data for Name: home_loans; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.home_loans (id, name, loan_type, principal_amount, current_balance, interest_rate, start_date, status, created_at, emi_amount, due_date, closing_date, account_number, tenure_months, end_date) FROM stdin;
1766039172707	UCO BANK	emi	1200000	1168892.9900000002	1.56	2025-05-09	active	2025-12-18 06:26:14.080564	22401	10	\N		121	2035-06-09
1766044066975	Vijaya	interest	150000	150000	2	2024-07-22	active	2025-12-18 07:47:48.697086	0	\N	\N	VJ23072024	\N	\N
1766044353769	Vijaya	interest	150000	150000	2	2025-01-26	active	2025-12-18 07:52:35.089347	0	\N	\N	VJ27012025	\N	\N
1766057204989	GoldLoan1	gold	100000	100000	0.75	2025-06-25	active	2025-12-18 11:26:46.47673	0	\N	\N	8068274523	\N	\N
\.


--
-- Data for Name: home_savings; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.home_savings (id, name, type, amount, start_date, end_date, duration, interest_rate, description, created_at, grams, rate, target_amount, symbol) FROM stdin;
1766055393045	Redblox	pf	64412	2022-09-01	\N		8.25		2025-12-18 10:56:35.004522	\N	\N	\N	\N
1766051695740	TM	gold_scheme	14700	2025-12-18	\N	11	\N		2025-12-18 09:54:57.504489	\N	\N	\N	\N
\.


--
-- Data for Name: home_savings_transactions; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.home_savings_transactions (id, saving_id, date, amount, type, description, created_at, grams, rate, employee_share, employer_share) FROM stdin;
1766052715283	1766051695740	2025-08-03	100	deposit	Deposit	2025-12-18 10:11:56.607548	0.011	9290	\N	\N
1766052763624	1766051695740	2025-08-20	500	deposit	Deposit	2025-12-18 10:12:45.102455	0.054	9180	\N	\N
1766052800228	1766051695740	2025-08-24	500	deposit	Deposit	2025-12-18 10:13:21.980157	0.054	9315	\N	\N
1766052852914	1766051695740	2025-09-09	1500	deposit	Deposit	2025-12-18 10:14:14.191103	0.153	9805	\N	\N
1766052895140	1766051695740	2025-10-01	1000	deposit	Deposit	2025-12-18 10:14:56.634628	0.091	10930	\N	\N
1766052924508	1766051695740	2025-10-02	6000	deposit	Deposit	2025-12-18 10:15:25.877742	0.551	10880	\N	\N
1766053023667	1766051695740	2025-10-22	1000	deposit	Deposit	2025-12-18 10:17:05.133659	0.086	11660	\N	\N
1766053045795	1766051695740	2025-10-29	1000	deposit	Deposit	2025-12-18 10:17:27.048355	0.09	11145	\N	\N
1766053112914	1766051695740	2025-11-27	100	deposit	Deposit	2025-12-18 10:18:34.679157	0.009	11725	\N	\N
1766053191051	1766051695740	2025-12-11	3000	deposit	Deposit	2025-12-18 10:19:52.312544	0.251	11935	\N	\N
1766055525951	1766055393045	2022-09-18	1440	deposit	Deposit	2025-12-18 10:58:47.686212	\N	\N	\N	\N
1766055577275	1766055393045	2022-10-31	1440	deposit	Deposit	2025-12-18 10:59:38.628364	\N	\N	\N	\N
1766055590495	1766055393045	2022-11-30	1440	deposit	Deposit	2025-12-18 10:59:52.110263	\N	\N	\N	\N
1766055605489	1766055393045	2022-12-31	1440	deposit	Deposit	2025-12-18 11:00:06.941783	\N	\N	\N	\N
1766055759422	1766055393045	2023-01-31	1872	deposit	Deposit	2025-12-18 11:02:41.309791	\N	\N	\N	\N
1766055777480	1766055393045	2023-02-28	1872	deposit	Deposit	2025-12-18 11:02:59.004237	\N	\N	\N	\N
1766055824623	1766055393045	2023-03-31	140	deposit	Deposit	2025-12-18 11:03:46.103324	\N	\N	\N	\N
1766055842698	1766055393045	2023-04-30	1872	deposit	Deposit	2025-12-18 11:04:04.022804	\N	\N	\N	\N
1766055858749	1766055393045	2023-05-31	1872	deposit	Deposit	2025-12-18 11:04:20.008419	\N	\N	\N	\N
1766055878570	1766055393045	2023-06-30	1872	deposit	Deposit	2025-12-18 11:04:39.956275	\N	\N	\N	\N
1766055933906	1766055393045	2023-08-31	1872	deposit	Deposit	2025-12-18 11:05:35.259637	\N	\N	\N	\N
1766056023732	1766055393045	2023-09-30	2160	deposit	Deposit	2025-12-18 11:07:05.054925	\N	\N	\N	\N
1766056058338	1766055393045	2023-10-31	2160	deposit	Deposit	2025-12-18 11:07:39.619342	\N	\N	\N	\N
1766056070843	1766055393045	2023-11-30	2160	deposit	Deposit	2025-12-18 11:07:52.282844	\N	\N	\N	\N
1766056084000	1766055393045	2023-12-31	2160	deposit	Deposit	2025-12-18 11:08:05.44159	\N	\N	\N	\N
1766056096792	1766055393045	2024-01-31	2160	deposit	Deposit	2025-12-18 11:08:18.158581	\N	\N	\N	\N
1766056110132	1766055393045	2024-02-29	2160	deposit	Deposit	2025-12-18 11:08:31.401184	\N	\N	\N	\N
1766056142359	1766055393045	2024-03-30	1206	deposit	Deposit	2025-12-18 11:09:03.829616	\N	\N	\N	\N
1766056163001	1766055393045	2024-04-30	2160	deposit	Deposit	2025-12-18 11:09:24.600695	\N	\N	\N	\N
1766056176766	1766055393045	2024-05-31	2160	deposit	Deposit	2025-12-18 11:09:38.140537	\N	\N	\N	\N
1766056194335	1766055393045	2024-06-06	2160	deposit	Deposit	2025-12-18 11:09:55.85607	\N	\N	\N	\N
1766056209763	1766055393045	2024-07-31	2160	deposit	Deposit	2025-12-18 11:10:11.139799	\N	\N	\N	\N
1766056227146	1766055393045	2024-08-08	2160	deposit	Deposit	2025-12-18 11:10:29.527869	\N	\N	\N	\N
1766056243027	1766055393045	2024-09-30	2160	deposit	Deposit	2025-12-18 11:10:44.281148	\N	\N	\N	\N
1766056287946	1766055393045	2024-10-31	3456	deposit	Deposit	2025-12-18 11:11:29.247667	\N	\N	\N	\N
1766056323917	1766055393045	2024-11-30	3456	deposit	Deposit	2025-12-18 11:12:05.21585	\N	\N	\N	\N
1766056378959	1766055393045	2024-12-30	3456	deposit	Deposit	2025-12-18 11:13:00.580191	\N	\N	\N	\N
1766056406387	1766055393045	2025-01-01	3456	deposit	Deposit	2025-12-18 11:13:27.800814	\N	\N	\N	\N
1766056438388	1766055393045	2025-01-01	3528	deposit	Deposit	2025-12-18 11:13:59.88523	\N	\N	\N	\N
1766056474377	1766055393045	2025-02-02	2802	deposit	Deposit	2025-12-18 11:14:35.804511	\N	\N	\N	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.orders (id, booking_date, due_date, customer_id, status, discount, total, payment_status, amount_received, items) FROM stdin;
\.


--
-- Data for Name: previous_month_item_stock; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.previous_month_item_stock (id, month, year, item_name, quantity, unit, created_at) FROM stdin;
\.


--
-- Data for Name: previous_month_raw_material_stock; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.previous_month_raw_material_stock (id, month, year, material_name, quantity, unit, created_at) FROM stdin;
1765776905827	12	2025	முட்டை 	4	kg	2025-12-15 05:35:07.649821
\.


--
-- Data for Name: production; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.production (id, date, item, qty, unit, batch_number, packed_qty) FROM stdin;
1764597235509	2025-12-01	எல் அடை	26.5	kg		25
1764689980230	2025-12-02	தேன்குழல்	22	kg		21
1764689963541	2025-12-02	எல் அடை	7	kg		6.6
1764772769554	2025-12-03	கை முறுக்கு	21.6	kg		21.2
1764861310905	2025-12-04	தேன்குழல்	3.5	kg		3.4
1764861175518	2025-12-04	கொத்துமுறுக்கு	20.2	kg		20.2
1764950622455	2025-12-05	தேன்குழல்	33	kg		32
1765380169459	2025-12-09	புடலங்காய் உருண்டை	20	kg		0
1765011362757	2025-12-06	எல் அடை	30.11	kg		27.9
1765380700512	2025-12-09	எல் அடை	18.164	kg		19
1765380999506	2025-12-10	அதிரசம்	11	kg		10.75
1765208716103	2025-12-08	கை முறுக்கு	13.6	kg		13.3
1765380982956	2025-12-10	தேன்குழல்	28.33	kg		22
1765625767325	2025-12-13	கை முறுக்கு	2	kg		1.8
1765625734539	2025-12-12	கை முறுக்கு	20.5	kg		20.2
1765762853881	2025-12-14	அதிரசம்	8	kg		0
1765764475454	2025-12-13	கொத்துமுறுக்கு	27.8	kg		0
1764861278330	2025-12-03	கை முறுக்கு	1	kg		1
1765900544318	2025-12-15	சோமாஸ்	6.6	kg		6
1765763508327	2025-12-14	தேன்குழல்	34.23	kg		33.8
1765900487361	2025-12-15	எல் அடை	19.6	kg		18.8
1765900602615	2025-12-16	எல் அடை	15.6	kg		14.6
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.products (id, name, category, unit, active, created_at, updated_at) FROM stdin;
1	கை முறுக்கு	\N	kg	t	2025-12-05 08:47:00.307848	2025-12-05 08:47:00.307848
2	தேன்குழல்	\N	kg	t	2025-12-05 08:47:00.307848	2025-12-05 08:47:00.307848
3	எல் அடை	\N	kg	t	2025-12-05 08:47:00.307848	2025-12-05 08:47:00.307848
4	கம்பு அடை	\N	kg	t	2025-12-05 08:47:00.307848	2025-12-05 08:47:00.307848
5	கொத்துமுறுக்கு	\N	kg	t	2025-12-05 08:47:00.307848	2025-12-05 08:47:00.307848
6	அதிரசம்	\N	kg	t	2025-12-05 08:47:00.307848	2025-12-05 08:47:00.307848
7	புடலங்காய் உருண்டை	\N	kg	t	2025-12-05 08:47:00.307848	2025-12-05 08:47:00.307848
8	சோமாஸ்	\N	kg	t	2025-12-05 08:47:00.307848	2025-12-05 08:47:00.307848
1764926970047	test2	\N	kg	f	2025-12-05 09:29:30.967506	2025-12-05 09:36:29.677129
1764927446875	TestItem	Test	kg	t	2025-12-05 09:37:27.991391	2025-12-05 09:37:27.991391
\.


--
-- Data for Name: raw_material_prices; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.raw_material_prices (id, name, unit, price_per_unit) FROM stdin;
1764597744727	வெல்லம் 	kg	50
1764640685715	எண்ணைய் 	lt	118
1764641275676	அரிசி மாவு 	kg	50
1764641521939	பொட்டு கடலை	kg	71.6
1764762631589	பொன்மணி அரிசி 	kg	10
1764762690183	எரிவாயுவு 	count	950
1764762706215	மிளகு	kg	900
1764762747413	பொருசிரவம் 	kg	200
1764762766881	மிளகாய் தூள் 	kg	200
1764762788521	எள்ளு 	kg	150
1764762801451	ஓமம்	kg	400
1764762828710	சக்கரை 	kg	50
1764762929090	ஏலக்காய் 	kg	3300
1764762599753	பச்சை அரிசி 	kg	10
1764762577075	கடலை	kg	150
1764861477064	முட்டை 	count	6
1764762843345	மைதா மாவு 	kg	50
1764998743837	கருவேப்பிலை 	rs	10
1765415492642	Box	count	4
1765814475925	ரவை	kg	45
1765901203922	உளுந்து 	kg	108
\.


--
-- Data for Name: raw_material_purchases; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.raw_material_purchases (id, date, material_name, qty, cost) FROM stdin;
\.


--
-- Data for Name: raw_material_usage; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.raw_material_usage (id, date, material_name, quantity_used, unit, notes, cost) FROM stdin;
1764641601667	2025-12-01	பொட்டு கடலை	4	kg		286.4
1764641685416	2025-12-02	அரிசி மாவு	21	kg		1050
1764764156553	2025-12-02	எரிவாயுவு 	1	count		950
1764764340394	2025-12-03	எண்ணைய் 	7	lt		826
1764764399021	2025-12-03	அரிசி மாவு 	17	kg		850
1764764412597	2025-12-03	பொட்டு கடலை	3	kg		214.8
1764765131074	2025-12-03	பச்சை அரிசி 	16	kg		160
1764640635363	2025-12-01	எண்ணைய் 	10	lt	1 box 	1180
1764764322658	2025-12-03	எண்ணைய் 	10	lt	1 box	1180
1764831736884	2025-12-02	எண்ணைய் 	10	lt	1 box	1180
1764861701861	2025-12-04	மைதா மாவு 	9	kg		450
1764861716575	2025-12-04	முட்டை 	10	count		60
1764861839004	2025-12-04	எண்ணைய் 	10	lt		1180
1764951010746	2025-12-05	பொட்டு கடலை	4	kg		286.4
1764951026273	2025-12-05	அரிசி மாவு 	28	kg		1400
1764951074940	2025-12-05	எரிவாயுவு 	1	count		950
1764998867721	2025-12-06	அரிசி மாவு 	21.4	kg		1070
1764998879150	2025-12-06	பொட்டு கடலை	4	kg		286.4
1764998893283	2025-12-06	கருவேப்பிலை 	1	rs		10
1764861727474	2025-12-04	சக்கரை 	4	kg		500
1764951122797	2025-12-05	எண்ணைய் 	15	lt		1770
1765209038602	2025-12-08	பச்சை அரிசி 	10	kg		100
1765382483083	2025-12-09	கடலை	10	kg		1500
1765382501248	2025-12-09	வெல்லம் 	5	kg		250
1765382545937	2025-12-09	மைதா மாவு 	1	kg		50
1765382598183	2025-12-09	பொட்டு கடலை	1.5	kg		107.4
1765382623519	2025-12-10	அரிசி மாவு 	20	kg		1000
1765382645542	2025-12-10	பொட்டு கடலை	4	kg		286.4
1765419460392	2025-12-10	எரிவாயுவு 	1	count		950
1765419575258	2025-12-11	எண்ணைய் 	15	lt		1770
1765765204380	2025-12-13	பச்சை அரிசி 	10	kg		100
1765765222722	2025-12-13	மைதா மாவு 	10	kg		500
1765765242019	2025-12-13	சக்கரை 	6	kg		300
1765814673025	2025-12-15	பச்சை அரிசி 	6	kg		60
1765814770957	2025-12-15	அரிசி மாவு 	14	kg		700
1765814787020	2025-12-15	பொட்டு கடலை	3.5	kg		250.6
1765814808769	2025-12-15	ரவை	2	kg		90
1765814850642	2025-12-15	சக்கரை 	2	kg		100
1765901293093	2025-12-16	அரிசி மாவு 	17	kg		850
1765901321785	2025-12-16	பொட்டு கடலை	3.5	kg		250.6
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.sales (id, date, customer_id, discount, total, payment_status, amount_received, items, buy_type) FROM stdin;
1764950887841	2025-12-05	1764589897034	0	1280	paid	0	[{"qty": 1, "name": "தேன்குழல்", "price": 170, "total": 170}, {"qty": 3, "name": "எல் அடை", "price": 170, "total": 510}, {"qty": 3, "name": "கொத்துமுறுக்கு", "price": 200, "total": 600}]	regular
1764998419196	2025-12-06	1764578278012	0	3060	not_paid	0	[{"qty": 10, "name": "கொத்துமுறுக்கு", "price": 170, "total": 1700}, {"qty": 8, "name": "கை முறுக்கு", "price": 170, "total": 1360}]	regular
1764604443984	2025-12-01	1764578278012	0	1190	not_paid	0	[{"qty": 7, "name": "தேன்குழல்", "price": 170, "total": 1190}]	regular
1764604594335	2025-12-01	1764578278012	0	68	not_paid	0	[{"qty": 0.4, "name": "எல் அடை", "price": 170, "total": 68}]	regular
1764640456861	2025-12-01	1764578278012	0	102	not_paid	0	[{"qty": 0.6, "name": "தேன்குழல்", "price": 170, "total": 102}]	regular
1764691677296	2025-12-02	1764597520779	0	900	paid	0	[{"qty": 2, "name": "எல் அடை", "price": 180, "total": 360}, {"qty": 2, "name": "தேன்குழல்", "price": 180, "total": 360}, {"qty": 1, "name": "கை முறுக்கு", "price": 180, "total": 180}]	regular
1764691718828	2025-12-02	1764589897034	0	700	paid	0	[{"qty": 2, "name": "கை முறுக்கு", "price": 180, "total": 360}, {"qty": 2, "name": "எல் அடை", "price": 170, "total": 340}]	regular
1764763262815	2025-12-01	1764578278012	0	1700	not_paid	0	[{"qty": 10, "name": "கை முறுக்கு", "price": 170, "total": 1700}]	regular
1764691860288	2025-12-02	1764597494613	0	550	paid	0	[{"qty": 1, "name": "கை முறுக்கு", "price": 180, "total": 180}, {"qty": 1, "name": "எல் அடை", "price": 170, "total": 170}, {"qty": 1, "name": "கொத்துமுறுக்கு", "price": 200, "total": 200}]	regular
1764691780814	2025-12-02	1764597470015	0	1020	paid	0	[{"qty": 2, "name": "கை முறுக்கு", "price": 170, "total": 340}, {"qty": 2, "name": "தேன்குழல்", "price": 170, "total": 340}, {"qty": 2, "name": "எல் அடை", "price": 170, "total": 340}]	regular
1764765706764	2025-12-03	1764589897034	0	340	paid	0	[{"qty": 2, "name": "தேன்குழல்", "price": 170, "total": 340}]	regular
1764765724543	2025-12-03	1764765681884	25	875	paid	0	[{"qty": 2, "name": "தேன்குழல்", "price": 250, "total": 500}, {"qty": 1, "name": "கை முறுக்கு", "price": 250, "total": 250}, {"qty": 0.6, "name": "எல் அடை", "price": 250, "total": 150}]	regular
1764862014238	2025-12-04	1764578278012	0	3910	not_paid	0	[{"qty": 13, "name": "தேன்குழல்", "price": 170, "total": 2210}, {"qty": 10, "name": "எல் அடை", "price": 170, "total": 1700}]	regular
1764913533607	2025-12-03	1764597494613	0	180	paid	0	[{"qty": 1, "name": "கை முறுக்கு", "price": 180, "total": 180}]	regular
1764950728373	2025-12-05	1764596744539	0	2800	not_paid	2400	[{"qty": 5, "name": "கொத்துமுறுக்கு", "price": 200, "total": 1000}, {"qty": 10, "name": "கை முறுக்கு", "price": 180, "total": 1800}]	regular
1765011494033	2025-12-06	1764765681884	13	199.5	paid	0	[{"qty": 0.2, "name": "கை முறுக்கு", "price": 250, "total": 50}, {"qty": 0.2, "name": "தேன்குழல்", "price": 250, "total": 50}, {"qty": 0.2, "name": "எல் அடை", "price": 250, "total": 50}, {"qty": 0.25, "name": "அதிரசம்", "price": 250, "total": 62.5}]	regular
1764604327204	2025-12-01	1764596744539	0	1800	not_paid	0	[{"qty": 10, "name": "தேன்குழல்", "price": 180, "total": 1800}]	regular
1765075148742	2025-12-07	1765075044951	200	0	paid	0	[{"qty": 0.4, "name": "தேன்குழல்", "price": 250, "total": 100}, {"qty": 0.2, "name": "கொத்துமுறுக்கு", "price": 250, "total": 50}, {"qty": 0.2, "name": "எல் அடை", "price": 250, "total": 50}]	regular
1764604356187	2025-12-01	1764596744539	0	1800	not_paid	0	[{"qty": 10, "name": "எல் அடை", "price": 180, "total": 1800}]	regular
1764950754082	2025-12-05	1764597558497	0	180	paid	0	[{"qty": 1, "name": "எல் அடை", "price": 180, "total": 180}]	regular
1765011163559	2025-12-06	1764596744539	0	2700	not_paid	2000	[{"qty": 5, "name": "தேன்குழல்", "price": 180, "total": 900}, {"qty": 10, "name": "எல் அடை", "price": 180, "total": 1800}]	regular
1764998499656	2025-12-06	1764589897034	0	360	paid	0	[{"qty": 2, "name": "கை முறுக்கு", "price": 180, "total": 360}]	regular
1764998479004	2025-12-06	1764765681884	0	500	paid	325	[{"qty": 1, "name": "கை முறுக்கு", "price": 250, "total": 250}, {"qty": 1, "name": "தேன்குழல்", "price": 250, "total": 250}]	regular
1765208759299	2025-12-08	1764589897034	0	1040	paid	1000	[{"qty": 2, "name": "கை முறுக்கு", "price": 180, "total": 360}, {"qty": 2, "name": "எல் அடை", "price": 170, "total": 340}, {"qty": 2, "name": "தேன்குழல்", "price": 170, "total": 340}]	regular
1765208800484	2025-12-08	1764597520779	0	900	paid	0	[{"qty": 1, "name": "கை முறுக்கு", "price": 180, "total": 180}, {"qty": 2, "name": "எல் அடை", "price": 180, "total": 360}, {"qty": 2, "name": "தேன்குழல்", "price": 180, "total": 360}]	regular
1765033235942	2025-12-06	1764597494613	0	550	paid	0	[{"qty": 0.8, "name": "கை முறுக்கு", "price": 180, "total": 144}, {"qty": 0.2, "name": "தேன்குழல்", "price": 180, "total": 36}, {"qty": 1, "name": "எல் அடை", "price": 170, "total": 170}, {"qty": 1, "name": "கொத்துமுறுக்கு", "price": 200, "total": 200}]	regular
1765208937878	2025-12-08	1764765681884	25	475	paid	475	[{"qty": 1.5, "name": "கை முறுக்கு", "price": 250, "total": 375}, {"qty": 0.5, "name": "எல் அடை", "price": 250, "total": 125}]	regular
1765380282879	2025-12-10	1764578278012	0	3400	not_paid	0	[{"qty": 10, "name": "புடலங்காய் உருண்டை", "price": 170, "total": 1700}, {"qty": 10, "name": "எல் அடை", "price": 170, "total": 1700}]	regular
1765381100754	2025-12-10	1764596744539	0	3600	not_paid	0	[{"qty": 10, "name": "எல் அடை", "price": 180, "total": 1800}, {"qty": 10, "name": "தேன்குழல்", "price": 180, "total": 1800}]	regular
1765381176075	2025-12-10	1764597494613	0	170	paid	0	[{"qty": 1, "name": "தேன்குழல்", "price": 170, "total": 170}]	regular
1765417606271	2025-12-11	1764578278012	0	1700	not_paid	0	[{"qty": 10, "name": "அதிரசம்", "price": 170, "total": 1700}]	regular
1765417671857	2025-12-11	1764597505842	0	900	paid	0	[{"qty": 5, "name": "கை முறுக்கு", "price": 180, "total": 900}]	regular
1765467372713	2025-12-11	1764589897034	0	680	paid	0	[{"qty": 1.6, "name": "கை முறுக்கு", "price": 170, "total": 272}, {"qty": 2.4, "name": "எல் அடை", "price": 170, "total": 408}]	regular
1765208846573	2025-12-08	1764597470015	0	1220	paid	0	[{"qty": 2, "name": "கை முறுக்கு", "price": 170, "total": 340}, {"qty": 2, "name": "எல் அடை", "price": 170, "total": 340}, {"qty": 2, "name": "தேன்குழல்", "price": 170, "total": 340}, {"qty": 1, "name": "கொத்துமுறுக்கு", "price": 200, "total": 200}]	regular
1765764557080	2025-12-15	1764597470015	0	1020	paid	0	[{"qty": 2, "name": "கை முறுக்கு", "price": 170, "total": 340}, {"qty": 2, "name": "எல் அடை", "price": 170, "total": 340}, {"qty": 2, "name": "தேன்குழல்", "price": 170, "total": 340}]	regular
1765764627783	2025-12-15	1764765681884	13	249.5	paid	0	[{"qty": 0.4, "name": "கை முறுக்கு", "price": 250, "total": 100}, {"qty": 0.4, "name": "எல் அடை", "price": 250, "total": 100}, {"qty": 0.25, "name": "அதிரசம்", "price": 250, "total": 62.5}]	regular
1765764770116	2025-12-13	1765075044951	300	0	paid	0	[{"qty": 0.2, "name": "கை முறுக்கு", "price": 250, "total": 50}, {"qty": 0.4, "name": "எல் அடை", "price": 250, "total": 100}, {"qty": 0.6, "name": "தேன்குழல்", "price": 250, "total": 150}]	regular
1765764847497	2025-12-14	1764589897034	0	540	paid	0	[{"qty": 3, "name": "கை முறுக்கு", "price": 180, "total": 540}]	regular
1765764920879	2025-12-14	1764765681884	13	199.5	paid	0	[{"qty": 0.4, "name": "கை முறுக்கு", "price": 250, "total": 100}, {"qty": 0.25, "name": "அதிரசம்", "price": 250, "total": 62.5}, {"qty": 0.2, "name": "கொத்துமுறுக்கு", "price": 250, "total": 50}]	regular
1765764947124	2025-12-14	1764578278012	0	1700	not_paid	0	[{"qty": 10, "name": "கொத்துமுறுக்கு", "price": 170, "total": 1700}]	regular
1765764971562	2025-12-14	1764589897034	0	600	paid	0	[{"qty": 3, "name": "கொத்துமுறுக்கு", "price": 200, "total": 600}]	regular
1765764996078	2025-12-15	1764578278012	0	1700	not_paid	0	[{"qty": 10, "name": "கை முறுக்கு", "price": 170, "total": 1700}]	regular
1765381222433	2025-12-10	1764765681884	0	200	paid	0	[{"qty": 1, "name": "அதிரசம்", "price": 200, "total": 200}]	regular
1765764814934	2025-12-13	1764578278012	0	935	not_paid	0	[{"qty": 5.5, "name": "தேன்குழல்", "price": 170, "total": 935}]	regular
1765764705709	2025-12-13	1764578278012	0	2040	not_paid	0	[{"qty": 12, "name": "தேன்குழல்", "price": 170, "total": 2040}]	regular
1765381141935	2025-12-10	1764597558497	0	360	paid	0	[{"qty": 2, "name": "எல் அடை", "price": 180, "total": 360}]	regular
1765901595496	2025-12-16	1764597520779	0	850	paid	0	[{"qty": 2, "name": "தேன்குழல்", "price": 170, "total": 340}, {"qty": 3, "name": "எல் அடை", "price": 170, "total": 510}]	regular
1765901703587	2025-12-16	1764597558497	0	2600	paid	0	[{"qty": 3, "name": "சோமாஸ்", "price": 250, "total": 750}, {"qty": 3, "name": "அதிரசம்", "price": 250, "total": 750}, {"qty": 1.6, "name": "எல் அடை", "price": 250, "total": 400}, {"qty": 2.4, "name": "தேன்குழல்", "price": 250, "total": 600}, {"qty": 0.4, "name": "கொத்துமுறுக்கு", "price": 250, "total": 100}]	regular
1765901812078	2025-12-16	1764765681884	0	575	paid	0	[{"qty": 0.4, "name": "கை முறுக்கு", "price": 250, "total": 100}, {"qty": 0.6, "name": "தேன்குழல்", "price": 250, "total": 150}, {"qty": 0.6, "name": "எல் அடை", "price": 250, "total": 150}, {"qty": 0.7, "name": "சோமாஸ்", "price": 250, "total": 175}]	regular
1765901856707	2025-12-16	1764589897034	0	780	paid	0	[{"qty": 1.5, "name": "சோமாஸ்", "price": 180, "total": 270}, {"qty": 3, "name": "தேன்குழல்", "price": 170, "total": 510}]	regular
1765901891807	2025-12-16	1764597494613	0	340	paid	0	[{"qty": 1, "name": "எல் அடை", "price": 170, "total": 170}, {"qty": 1, "name": "தேன்குழல்", "price": 170, "total": 170}]	regular
1765901998778	2025-12-12	1765075044951	200	0	paid	0	[{"qty": 0.2, "name": "எல் அடை", "price": 250, "total": 50}, {"qty": 0.2, "name": "கை முறுக்கு", "price": 250, "total": 50}, {"qty": 0.2, "name": "கொத்துமுறுக்கு", "price": 250, "total": 50}, {"qty": 0.2, "name": "தேன்குழல்", "price": 250, "total": 50}]	regular
1765935558738	2025-12-17	1764578278012	0	2040	paid	0	[{"qty": 12, "name": "தேன்குழல்", "price": 170, "total": 2040}]	regular
\.


--
-- Data for Name: stocks; Type: TABLE DATA; Schema: public; Owner: radha
--

COPY public.stocks (type, name, qty, unit) FROM stdin;
product	கம்பு அடை	0	kg
raw_material	சக்கரை 	0	kg
raw_material	மிளகு	0.65	kg
raw_material	ஏலக்காய் 	0.1	kg
raw_material	வெல்லம்	18	kg
raw_material	எரிவாயுவு 	5	count
raw_material	மிளகாய் தூள்	1.8	kg
raw_material	சீரகம்	1.2	kg
raw_material	உளுந்து 	15	kg
raw_material	எண்ணைய் 	75	lt
raw_material	அரிசி மாவு 	25.6	kg
raw_material	பொட்டு கடலை	32.5	kg
raw_material	எள்ளு 	4.15	kg
raw_material	பொருசிரவம் 	1.2	kg
product	அதிரசம்	5.25	kg
raw_material	கருவேப்பிலை 	-1	rs
product	புடலங்காய் உருண்டை	10	kg
product	சோமாஸ்	1.4	kg
product	எல் அடை	32.2	kg
product	கை முறுக்கு	1.6	kg
product	கொத்துமுறுக்கு	9.8	kg
product	தேன்குழல்	32.86	kg
raw_material	கடலை	-10	kg
raw_material	வெல்லம் 	-5	kg
raw_material	முட்டை 	0	count
raw_material	Box	100	count
raw_material	மைதா மாவு 	-8	kg
raw_material	பச்சை அரிசி 	98	kg
raw_material	ரவை	0	kg
\.


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: farm_crops farm_crops_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_crops
    ADD CONSTRAINT farm_crops_pkey PRIMARY KEY (id);


--
-- Name: farm_expense_categories farm_expense_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_expense_categories
    ADD CONSTRAINT farm_expense_categories_name_key UNIQUE (name);


--
-- Name: farm_expense_categories farm_expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_expense_categories
    ADD CONSTRAINT farm_expense_categories_pkey PRIMARY KEY (id);


--
-- Name: farm_expense_subcategories farm_expense_subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_expense_subcategories
    ADD CONSTRAINT farm_expense_subcategories_pkey PRIMARY KEY (id);


--
-- Name: farm_expenses farm_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_expenses
    ADD CONSTRAINT farm_expenses_pkey PRIMARY KEY (id);


--
-- Name: farm_income farm_income_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_income
    ADD CONSTRAINT farm_income_pkey PRIMARY KEY (id);


--
-- Name: farm_timeline farm_timeline_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_timeline
    ADD CONSTRAINT farm_timeline_pkey PRIMARY KEY (id);


--
-- Name: home_expense_items home_expense_items_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.home_expense_items
    ADD CONSTRAINT home_expense_items_pkey PRIMARY KEY (id);


--
-- Name: home_expenses home_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.home_expenses
    ADD CONSTRAINT home_expenses_pkey PRIMARY KEY (id);


--
-- Name: home_income home_income_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.home_income
    ADD CONSTRAINT home_income_pkey PRIMARY KEY (id);


--
-- Name: home_loan_transactions home_loan_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.home_loan_transactions
    ADD CONSTRAINT home_loan_transactions_pkey PRIMARY KEY (id);


--
-- Name: home_loans home_loans_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.home_loans
    ADD CONSTRAINT home_loans_pkey PRIMARY KEY (id);


--
-- Name: home_savings home_savings_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.home_savings
    ADD CONSTRAINT home_savings_pkey PRIMARY KEY (id);


--
-- Name: home_savings_transactions home_savings_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.home_savings_transactions
    ADD CONSTRAINT home_savings_transactions_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: previous_month_item_stock previous_month_item_stock_month_year_item_name_key; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.previous_month_item_stock
    ADD CONSTRAINT previous_month_item_stock_month_year_item_name_key UNIQUE (month, year, item_name);


--
-- Name: previous_month_item_stock previous_month_item_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.previous_month_item_stock
    ADD CONSTRAINT previous_month_item_stock_pkey PRIMARY KEY (id);


--
-- Name: previous_month_raw_material_stock previous_month_raw_material_stock_month_year_material_name_key; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.previous_month_raw_material_stock
    ADD CONSTRAINT previous_month_raw_material_stock_month_year_material_name_key UNIQUE (month, year, material_name);


--
-- Name: previous_month_raw_material_stock previous_month_raw_material_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.previous_month_raw_material_stock
    ADD CONSTRAINT previous_month_raw_material_stock_pkey PRIMARY KEY (id);


--
-- Name: production production_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.production
    ADD CONSTRAINT production_pkey PRIMARY KEY (id);


--
-- Name: products products_name_key; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_name_key UNIQUE (name);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: raw_material_prices raw_material_prices_name_key; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.raw_material_prices
    ADD CONSTRAINT raw_material_prices_name_key UNIQUE (name);


--
-- Name: raw_material_prices raw_material_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.raw_material_prices
    ADD CONSTRAINT raw_material_prices_pkey PRIMARY KEY (id);


--
-- Name: raw_material_purchases raw_material_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.raw_material_purchases
    ADD CONSTRAINT raw_material_purchases_pkey PRIMARY KEY (id);


--
-- Name: raw_material_usage raw_material_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.raw_material_usage
    ADD CONSTRAINT raw_material_usage_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: stocks stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_pkey PRIMARY KEY (type, name);


--
-- Name: attendance attendance_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: farm_expense_subcategories farm_expense_subcategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_expense_subcategories
    ADD CONSTRAINT farm_expense_subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.farm_expense_categories(id) ON DELETE CASCADE;


--
-- Name: farm_expenses farm_expenses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_expenses
    ADD CONSTRAINT farm_expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.farm_expense_categories(id);


--
-- Name: farm_expenses farm_expenses_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_expenses
    ADD CONSTRAINT farm_expenses_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES public.farm_crops(id);


--
-- Name: farm_expenses farm_expenses_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_expenses
    ADD CONSTRAINT farm_expenses_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.farm_expense_subcategories(id);


--
-- Name: farm_income farm_income_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_income
    ADD CONSTRAINT farm_income_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES public.farm_crops(id);


--
-- Name: farm_timeline farm_timeline_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.farm_timeline
    ADD CONSTRAINT farm_timeline_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES public.farm_crops(id) ON DELETE CASCADE;


--
-- Name: home_loan_transactions home_loan_transactions_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.home_loan_transactions
    ADD CONSTRAINT home_loan_transactions_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.home_loans(id) ON DELETE CASCADE;


--
-- Name: home_savings_transactions home_savings_transactions_saving_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.home_savings_transactions
    ADD CONSTRAINT home_savings_transactions_saving_id_fkey FOREIGN KEY (saving_id) REFERENCES public.home_savings(id) ON DELETE CASCADE;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: sales sales_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: radha
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO radha;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO radha;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO radha;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO radha;


--
-- PostgreSQL database dump complete
--

\unrestrict PR6U6yN9b9NNsCneCkYylbrgNR37Bt6CzI0FcQvtrTTbibVQJ3xF7wXiFRwpetG

