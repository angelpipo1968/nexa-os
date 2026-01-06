# dag_factory.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

def run_crawler(region):
    print(f"Running crawler for region: {region}")
    # Logic to trigger crawler_node.py would go here

def analyze_with_gpt4(**context):
    print("Analyzing data with GPT-4...")

def create_crawler_dag(region):
    default_args = {
        'owner': 'nexa_ai',
        'retries': 3,
        'retry_delay': timedelta(minutes=5),
        'region': region,
        'start_date': datetime(2025, 1, 1)
    }

    dag = DAG(
        f'crawler_{region}',
        default_args=default_args,
        schedule_interval='*/30 * * * *',
        catchup=False
    )

    crawl_task = PythonOperator(
        task_id='crawl_websites',
        python_callable=run_crawler,
        op_kwargs={'region': region},
        dag=dag
    )

    analyze_task = PythonOperator(
        task_id='analyze_data',
        python_callable=analyze_with_gpt4,
        provide_context=True,
        dag=dag
    )

    crawl_task >> analyze_task
    return dag

# Create DAGs for different regions
dag_na = create_crawler_dag('NA')
dag_eu = create_crawler_dag('EU')
