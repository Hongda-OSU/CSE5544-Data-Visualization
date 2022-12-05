import pandas as pd

energy_df = pd.read_csv('src_data/electricity_generation.csv', index_col=0)
region_df = pd.read_csv('src_data/us_regions_divisions.csv').rename(
    columns={"State": "STATE", "State Code": "STATE_CODE"})

# step 1: Find data records from 2021/01 to 2021/12
monthly_df = energy_df.loc[(energy_df["YEAR"] == 2021)
                           & (energy_df["STATE"] != "US-TOTAL")
                           & (energy_df["ENERGY SOURCE"] != "Total")
                           & (energy_df["TYPE OF PRODUCER"] != "Total Electric Power Industry")]
monthly_df.reset_index(drop=True, inplace=True)

# step 2: Calculate the yearly sum of electricity GENERATION based on STATE.
electric_df = monthly_df.groupby(["STATE"], as_index=False)[
    "GENERATION (Megawatthours)"].sum().rename(columns={"GENERATION (Megawatthours)": "GENERATION", "STATE": "STATE_CODE"})

# step 3: Join us_regions.csv with 2021 yearly sum data on 'STATE CODE'
region_electric_df = pd.merge(electric_df, region_df, on="STATE_CODE")

# step 4: Output a CSV file which should contain 3 columns: STATE, STATE_CODE, GENERATION
column_list = ["STATE", "STATE_CODE", "GENERATION"]
region_electric_df.to_csv(
    'processed_data/ChoroplethMapData.csv', columns=column_list, index=False)

# step 5: Find total generation from 2021/01 to 2021/12
electric_month_df = monthly_df.groupby(["STATE", "MONTH"], as_index=False)[
    "GENERATION (Megawatthours)"].sum().rename(columns={"GENERATION (Megawatthours)": "GENERATION(Mwh)", "STATE": "STATE_CODE"})

electric_month_df = pd.merge(electric_month_df, region_df, on="STATE_CODE")

# step 6: Output a CSV file which should contain 3 columns: MONTH, STATE, GENERATION(Mwh)
column_list = ["MONTH", "STATE", "GENERATION(Mwh)"]
electric_month_df.to_csv(
    'processed_data/BarChartData.csv', columns=column_list, index=False)

# step 7: According to the original energy data, select 2021 monthly data based on TYPE OF PRODUCER
# Calculate the yearly sum of total GENERATION based on TYPE OF PRODUCER and STATE.
electric_producer_df = monthly_df.groupby(["TYPE OF PRODUCER", "STATE"], as_index=False)[
    "GENERATION (Megawatthours)"].sum().rename(columns={"GENERATION (Megawatthours)": "GENERATION(Mwh)", "STATE": "STATE_CODE"})

electric_producer_df = pd.merge(electric_producer_df, region_df, on="STATE_CODE")

# step 8: Use pandas.pivot_table to rearrange the dataframe (producer data by state)
pivot_df = pd.pivot_table(electric_producer_df, values="GENERATION(Mwh)", index="STATE", columns="TYPE OF PRODUCER")

# step 9: Output the CSV file
pivot_df.to_csv(
    'processed_data/PieChartData.csv')