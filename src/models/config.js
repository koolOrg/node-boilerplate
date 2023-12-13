require('dotenv').config();
export const development = {
    use_env_variable: 'DB_URL',
    dialect: 'mysql',
};
export const test = {
    use_env_variable: 'DB_URL',
    dialect: 'mysql',
};
export const production = {
    use_env_variable: 'DB_URL',
    dialect: 'mysql',
};
