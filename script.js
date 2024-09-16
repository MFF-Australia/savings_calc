document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    updateResults();

    function setupEventListeners() {
        document.querySelectorAll('#initialAmount, #regularDeposit, #frequency, #interestRate, #savingTerm').forEach(input => {
            input.addEventListener('input', updateResults);
        });

        document.getElementById('resetButton').addEventListener('click', () => {
            resetForm();
            updateResults();
        });

        document.getElementById('printButton').addEventListener('click', () => {
            window.print();
        });

        document.getElementById('assumptionsButton').addEventListener('click', openModal);
        document.getElementById('closeModal').addEventListener('click', closeModal);
        document.getElementById('closeButton').addEventListener('click', closeModal);

        window.addEventListener('click', function (event) {
            const modal = document.getElementById('assumptionModal');
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    function resetForm() {
        document.getElementById('initialAmount').value = '$5,000';
        document.getElementById('regularDeposit').value = '$1,000';
        document.getElementById('frequency').value = 'monthly';
        document.getElementById('interestRate').value = '6%';
        document.getElementById('savingTerm').value = '10 years';
    }

    function openModal() {
        const modal = document.getElementById('assumptionModal');
        modal.style.display = 'block';
    }

    function closeModal() {
        const modal = document.getElementById('assumptionModal');
        modal.style.display = 'none';
    }

    function cleanInput(input) {
        return parseFloat(input.replace(/[^\d.-]/g, '')) || 0;
    }

    function updateResults() {
        const initialAmount = cleanInput(document.getElementById('initialAmount').value);
        const regularDeposit = cleanInput(document.getElementById('regularDeposit').value);
        const frequency = document.getElementById('frequency').value;
        const interestRate = cleanInput(document.getElementById('interestRate').value.replace('%', '')) / 100;
        const savingTerm = cleanInput(document.getElementById('savingTerm').value);

        const frequencies = {
            monthly: 12,
            fortnightly: 26,
            weekly: 52
        };

        const periodsPerYear = frequencies[frequency];
        const periodRate = interestRate / periodsPerYear;
        const totalPeriods = savingTerm * periodsPerYear;

        let totalAmount = initialAmount;
        let totalDeposits = initialAmount;
        const investmentData = [initialAmount];
        const interestData = [0];
        const labels = Array.from({ length: savingTerm + 1 }, (_, i) => i.toString());

        for (let year = 1; year <= savingTerm; year++) {
            const periodsInYear = year * periodsPerYear;
            totalAmount = initialAmount * Math.pow((1 + periodRate), periodsInYear) + regularDeposit * (Math.pow((1 + periodRate), periodsInYear) - 1) / periodRate;
            totalDeposits = initialAmount + regularDeposit * periodsInYear;
            investmentData.push(totalDeposits);
            interestData.push(totalAmount - totalDeposits);
        }

        const totalInterest = totalAmount - totalDeposits;

        document.getElementById('totalAmount').textContent = `$${Math.round(totalAmount).toLocaleString()}`;
        document.getElementById('totalDeposits').textContent = `$${Math.round(totalDeposits).toLocaleString()}`;
        document.getElementById('totalInterest').textContent = `$${Math.round(totalInterest).toLocaleString()}`;

        updateChart(labels, investmentData, interestData);
    }

    function updateChart(labels, investmentData, interestData) {
        const ctx = document.getElementById('savingsChart').getContext('2d');

        if (window.savingsChart instanceof Chart) {
            window.savingsChart.destroy();
        }

        window.savingsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Investment',
                        data: investmentData,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Total Interest',
                        data: interestData,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Years'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Savings'
                        },
                        ticks: {
                            callback: function (value) {
                                if (value >= 1000) {
                                    return (value / 1000) + 'K';
                                }
                                return value;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label;
                                const value = Math.round(context.raw).toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                });
                                return `${label}: ${value}`;
                            },
                            title: function (context) {
                                return `Year: ${context[0].label}`;
                            }
                        },
                        displayColors: false
                    },
                    legend: {
                        labels: {
                            usePointStyle: true
                        }
                    }
                },
                plugins: {
                    'chartjs-plugin-3d': {
                        enabled: true,
                        z: 15,
                        shadowColor: 'rgba(0, 0, 0, 0.1)',
                        shadowBlur: 5,
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }
            }
        });


    }
});
