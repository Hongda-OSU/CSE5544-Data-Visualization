import pandas as pd
import json

energy_df = pd.read_csv('src_data/electricity_generation.csv', index_col=0)
region_df = pd.read_csv('src_data/us_regions_divisions.csv').rename(
    columns={"State": "STATE", "State Code": "STATE_CODE"})


def processLeafDf(df):
    list = []
    for index, row in df.iterrows():
        dict = {"name": row["STATE_CODE"], "value": row["GENERATION"]}
        list.append(dict)
    return list


def processNodeDf(df, regions):
    list = []
    for region in regions:
        r_df = df.loc[(df["Region"] == region)]
        dict = {"name": region, "children": processLeafDf(r_df.reset_index())}
        list.append(dict)

    west = 0
    south = 0
    northEast = 0
    midWest = 0
    for index, dict in enumerate(list):
        if dict["name"] == 'West':
            west = index
        if dict["name"] == 'South':
            south = index
        if dict["name"] == 'Northeast':
            northEast = index
        if dict["name"] == 'Midwest':
            midWest = index

    order = [midWest, northEast, south, west]
    ordered_list = [list[i] for i in order]
    return ordered_list


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

# step 5: Select the following 5 states: 'IL', 'IN', 'MI', 'OH', 'WI' from 2021 monthly data
electric_month_df = monthly_df.groupby(["STATE", "MONTH"], as_index=False)[
    "GENERATION (Megawatthours)"].sum().rename(columns={"GENERATION (Megawatthours)": "GENERATION"})
state_df = electric_month_df.loc[electric_month_df["STATE"].isin(
    ['IL', 'IN', 'MI', 'OH', 'WI'])]
state_df.reset_index(drop=True, inplace=True)

# step 6: Output a CSV file which should contain 3 columns: MONTH, STATE, GENERATION
column_list = ["MONTH", "STATE", "GENERATION"]
state_df.to_csv('processed_data/HeatMapData.csv',
                columns=column_list, index=False)

# step 7: Rearrange the data in H to the following format and output a JSON file through json library in Python in step 3
regions = region_electric_df.Region.unique()
dict = {"name": "US", "children": processNodeDf(region_electric_df, regions)}
with open('processed_data/TreeMapData.json', 'w') as fp:
    json.dump(dict, fp, indent=4)
