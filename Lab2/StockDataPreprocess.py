import pandas as pd
import functools as ft
aapl_df = pd.read_csv('AAPL Historical Data.csv', index_col='Date')
amzn_df = pd.read_csv('AMZN Historical Data.csv', index_col='Date')
googl_df = pd.read_csv('GOOGL Historical Data.csv', index_col='Date')
meta_df = pd.read_csv('META Historical Data.csv', index_col='Date')
nas_df = pd.read_csv('Nasdaq 100 Historical Data.csv', index_col='Date')

def get_sevenday_price_ma(df, col_name):
    price_df = df['Price'][::-1].to_frame()
    price_df[col_name] = price_df['Price'].rolling(window=7, min_periods=1).mean()
    price_ma_df = price_df.drop(columns=['Price'])
    return price_ma_df

# step 1: Calculate 7 days average price of AAPL, GOOGL, META, AMZN
aapl_price_ma_df = get_sevenday_price_ma(aapl_df, 'AAPL_moving_avg')
amzn_price_ma_df = get_sevenday_price_ma(amzn_df, 'AMZN_moving_avg')
googl_priec_ma_df = get_sevenday_price_ma(googl_df, 'GOOGL_moving_avg')
meta_priec_ma_df = get_sevenday_price_ma(meta_df, 'META_moving_avg')

# step 2: Output a CSV file which should contain 5 columns: Date, AAPL_moving_avg, GOOGL_moving_avg, META_moving_avg, AMZN_moving_avg
price_ma_dfs = [aapl_price_ma_df,
                googl_priec_ma_df, meta_priec_ma_df, amzn_price_ma_df]
price_ma_dfs = ft.reduce(lambda left, right: pd.merge(
    left, right, on='Date'), price_ma_dfs)
price_ma_dfs.reset_index(inplace=True)
price_ma_dfs.to_csv("price_ma_dfs.csv", index=False)

# step 3: Output a CSV file which should contain 6 columns: Date, NDX_price, AAPL_price, GOOGL_price, META_price, AMZN_price
price_dfs = [nas_df['Price'].to_frame("NDX_price"), aapl_df['Price'].to_frame("AAPL_price"), googl_df['Price'].to_frame(
    "GOOGL_price"), meta_df['Price'].to_frame("META_price"), amzn_df['Price'].to_frame("AMZN_price")]
price_dfs = ft.reduce(lambda left, right: pd.merge(
    left, right, on='Date'), price_dfs)
price_dfs.reset_index(inplace=True)
price_dfs.to_csv("price_dfs.csv", index=False)
