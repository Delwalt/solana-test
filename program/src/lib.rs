use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    // Iterating accounts
    let accounts_iter = &mut accounts.iter();

    // Get the account whose balance we want to retrieve
    let account = next_account_info(accounts_iter)?;

    // Retrieve the account balance
    let balance = account.lamports();

    // You can use the balance variable as needed, for example, log it, return it, etc.
    // For this example, we will simply print it.
    msg!("Account balance: {}", balance);

    Ok(())
}
