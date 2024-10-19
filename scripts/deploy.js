async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Increment = await ethers.getContractFactory("State");
    const increment = await Increment.deploy();

    console.log("Increment contract deployed to:", increment.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });