import pandas as pd

energy_df = pd.read_csv('organised_Gen.csv', index_col=0)
state_df = pd.read_csv('states.csv')

# step 1: Find Ohio(OH) data records from 2017/01 to 2021/12.
ohio_code = state_df.loc[state_df["State"] == "Ohio"]["Code"]
ohio_energy_df = energy_df.loc[(energy_df["STATE"].isin(ohio_code)) & (
    energy_df["YEAR"] >= 2017) & (energy_df["YEAR"] <= 2021) & (energy_df["ENERGY SOURCE"] != "Total") & (energy_df["TYPE OF PRODUCER"] != "Total Electric Power Industry")]
ohio_energy_df.reset_index(drop=True, inplace=True)

# step 2: Calculate the yearly sumof electricity GENERATION based on ENERGY SOURCE.
ohio_electric_df = ohio_energy_df.groupby(["YEAR", "ENERGY SOURCE"], as_index=False)[
    "GENERATION (Megawatthours)"].sum().rename(columns={"GENERATION (Megawatthours)": "GENERATION"})

# step 3: Select the top 3 energy sources generation for every year.
# ohio_electric_df.groupby('YEAR').apply(lambda x : x.sort_values(by = 'GENERATION', ascending = False).head(3).reset_index(drop = True)).reset_index(drop = True)
ohio_electric_df = ohio_electric_df.groupby(['YEAR']).apply(
    lambda x: x.nlargest(3, ['GENERATION'])).reset_index(drop=True)

# step 4: Output a CSV file which should contain 3 columns: YEAR, ENERGY SOURCE, GENERATION.
ohio_electric_df.to_csv('ohio_electric_df.csv', index=False)

# step 5: Calculate the yearly sum of total GENERATION.
ohio_total_df = ohio_energy_df.groupby(['YEAR'], as_index=False)["GENERATION (Megawatthours)"].sum(
).rename(columns={"GENERATION (Megawatthours)": "TOTAL_GENERATION"})

# step 6: Output a CSV file which should contain 2 columns: YEAR, TOTAL_GENERATION
ohio_total_df.to_csv('ohio_total_df.csv', index=False)

# step 7: Calculate the summation of total GENERATION based on TYPE OF PRODUCER.
ohio_producer_df = ohio_energy_df.groupby(['TYPE OF PRODUCER'], as_index=False)[
    "GENERATION (Megawatthours)"].sum().rename(columns={"GENERATION (Megawatthours)": "GENERATION"})

# step 8: Output a CSV file which should contain 2 columns: TYPE OF PRODUCER, GENERATION
ohio_producer_df.to_csv('ohio_producer_df.csv', index=False)
