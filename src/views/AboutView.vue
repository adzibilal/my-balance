<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const transactions = ref([])
const balance = ref([])
const income = ref(0)
const expense = ref(0)
const incomeFilter = ref(0)
const expenseFilter = ref(0)
const isAdd = ref(false)
const isFilter = ref(false)

const valAmount = ref(0)
const valType = ref('income')
const valDesc = ref('')
const startDate = ref(null)
const endDate = ref(null)

async function getTransactions() {
  const { data } = await supabase.from('transactions').select().order('date', { ascending: false })
  transactions.value = data

  if (income.value != 0 || expense.value != 0) {
    income.value = 0
    expense.value = 0
  }

  transactions.value.forEach((transaction) => {
    if (transaction.type === 'income') {
      income.value += transaction.amount
    } else {
      expense.value += transaction.amount
    }
  })
}
async function getBalance() {
  const { data } = await supabase.from('balance').select()
  balance.value = data
  console.error(balance.value)
}
async function filterTransactions() {
  console.error(startDate.value, endDate.value)
  const { data } = await supabase
    .from('transactions')
    .select()
    .order('date', { ascending: false })
    .gte('date', formatStartTime(new Date(startDate.value)))
    .lt('date', formatEndTime(new Date(endDate.value)))

  console.error(data)
  transactions.value = data

  if (incomeFilter.value != 0 || expenseFilter.value != 0) {
    incomeFilter.value = 0
    expenseFilter.value = 0
  }

  transactions.value.forEach((transaction) => {
    if (transaction.type === 'income') {
      incomeFilter.value += transaction.amount
    } else {
      expenseFilter.value += transaction.amount
    }
  })
}
function formatRupiah(angka) {
  let rupiah = ''
  const angkaRev = angka.toString().split('').reverse().join('')
  for (let i = 0; i < angkaRev.length; i++) {
    if (i % 3 == 0) {
      rupiah += angkaRev.substr(i, 3) + '.'
    }
  }
  return (
    'Rp. ' +
    rupiah
      .split('', rupiah.length - 1)
      .reverse()
      .join('')
  )
}

function formatDateTime(dateTimeString) {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ]

  const [datePart, timePart] = dateTimeString.split('T')
  const [year, month, day] = datePart.split('-')
  const [hour, minute] = timePart.split(':')

  const formattedDate = `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`
  const formattedTime = `Pukul ${hour}:${minute}`

  return `${formattedDate}, ${formattedTime}`
}

function formatStartTime(time) {
  const now = time
  const dateObj = new Date(now)
  const year = dateObj.getFullYear()
  const month = ('0' + (dateObj.getMonth() + 1)).slice(-2)
  const date = ('0' + dateObj.getDate()).slice(-2)

  return `${year}-${month}-${date}T00:00:00`
}
function formatEndTime(time) {
  const now = time
  const dateObj = new Date(now)
  const year = dateObj.getFullYear()
  const month = ('0' + (dateObj.getMonth() + 1)).slice(-2)
  const date = ('0' + dateObj.getDate()).slice(-2)

  return `${year}-${month}-${date}T23:59:59`
}

function curTime() {
  const now = Date.now()
  const dateObj = new Date(now)
  const year = dateObj.getFullYear()
  const month = ('0' + (dateObj.getMonth() + 1)).slice(-2)
  const date = ('0' + dateObj.getDate()).slice(-2)
  const hours = ('0' + dateObj.getHours()).slice(-2)
  const minutes = ('0' + dateObj.getMinutes()).slice(-2)
  const seconds = ('0' + dateObj.getSeconds()).slice(-2)

  return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`
}

async function addTransaction() {
  const formattedTime = curTime()
  console.error(formattedTime)
  const { error } = await supabase.from('transactions').insert({
    type: valType.value,
    amount: valAmount.value,
    date: formattedTime,
    description: valDesc.value
  })

  if (error) {
    console.error('addTransaction', error)
  } else {
    valAmount.value = 0
    valDesc.value = ''
    getTransactions()
    getBalance()
    isAdd.value = false
  }
}

async function deleteTransaction(id) {
  if (confirm('Yakin Ingin Menghapus?') == true) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)

    if (error) {
      console.error('deleteTransaction', error)
    } else {
      getTransactions()
      getBalance()
      console.error(id)
    }
  }
}

function toggleFilter() {
  if (!isFilter.value) {
    isFilter.value = true
  } else {
    isFilter.value = false
    incomeFilter.value = 0
    expenseFilter.value = 0
    getTransactions()
    getBalance()
  }
}
onMounted(() => {
  getTransactions()
  getBalance()
  // getStat()
  // addTransaction()
})
</script>

<template>
  <div class="transaction-contianer">
    <div>
      <p>Balance</p>
      <div class="statistik balance text-green" v-for="(item, index) in balance" :key="index">
        {{ formatRupiah(item.balance) }}
      </div>
    </div>
    <div class="btn btn-sm btn-warning btn-filter" v-if="!isFilter" @click="toggleFilter">
      Filter
    </div>
    <div class="btn btn-sm btn-warning btn-filter" v-if="isFilter" @click="toggleFilter">
      Hapus Filter
    </div>
    <div class="grid-statistik">
      <div>
        <p>Pemasukan</p>
        <div class="statistik text-green">
          {{ formatRupiah(income) }}
        </div>
      </div>
      <div>
        <p>Pengeluaran</p>
        <div class="statistik text-red">
          {{ formatRupiah(expense) }}
        </div>
      </div>
    </div>
    <br />
    <div class="btn btn-primary btn-transaction" @click="isAdd = true">Transaksi Baru</div>
    <input class="form-control" v-if="isFilter" v-model="startDate" type="date" name="" id="" />
    <input class="form-control" v-if="isFilter" v-model="endDate" type="date" name="" id="" />
    <div class="btn btn-warning btn-transaction" v-if="isFilter" @click="filterTransactions">
      Filter
    </div>
    <p v-if="(incomeFilter != 0 || expenseFilter != 0) && isFilter">Statistik Filter</p>
    <div class="grid-statistik" v-if="(incomeFilter != 0 || expenseFilter != 0) && isFilter">
      <div>
        <p>Pemasukan</p>
        <div class="statistik text-green">
          {{ formatRupiah(incomeFilter) }}
        </div>
      </div>
      <div>
        <p>Pengeluaran</p>
        <div class="statistik text-red">
          {{ formatRupiah(expenseFilter) }}
        </div>
      </div>
    </div>

    <div class="scroller-transaction">
      <div v-for="transaction in transactions" :key="transaction.id" class="item-transaction">
        <div
          class="amount"
          :class="{
            'text-green': transaction.type === 'income',
            'text-red': transaction.type === 'expense'
          }"
        >
          {{ formatRupiah(transaction.amount) }}
        </div>
        <div
          class="type"
          :class="{
            'text-green': transaction.type === 'income',
            'text-red': transaction.type === 'expense'
          }"
        >
          {{ transaction.type }}
        </div>
        <div class="date">{{ formatDateTime(transaction.date) }}</div>
        <div class="description">{{ transaction.description }}</div>
        <div class="delete" @click="deleteTransaction(transaction.id)">x</div>
      </div>
    </div>
    <div class="black-overlay" v-if="isAdd" @click="isAdd = false"></div>
    <div class="modal-add" v-if="isAdd">
      <p>Type</p>
      <select class="form-select" name="" id="" v-model="valType">
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <p>Amount</p>
      <input type="text" class="form-control" name="" id="input-amount" v-model="valAmount" />
      <p>Description</p>
      <input type="text" class="form-control" name="" id="" v-model="valDesc" />
      <div class="btn-transaction btn btn-success" @click="addTransaction">Tambah</div>
    </div>
  </div>
</template>
