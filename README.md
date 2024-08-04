<p style="text-align:center; font-size: 24px; font-weight: bold; margin-bottom: 0px">
M3Flow (in developing)
</p>  

<p style="text-align:center; font-size: 12px">
<b>M3Flow</b> helps teams and individuals manage data and operations quickly and without abstractions
</p>

<p align="center" style="margin-bottom: 7px">
<picture>
  <img alt="M3Flow" src="https://res.cloudinary.com/wireforce/image/upload/v1722810485/Introduce_mbydeg.png"/>
</picture>
</p>

<div style="text-align:center">
    <a href="#">Documentation</a> | 
    <a href="#">Demo</a>
</div>

# Install
Installing the M3 is very easy. You must have <a href='https://docs.docker.com/engine/install/'>Docker</a> pre-installed

```bash
git clone https://github.com/Wireforce-LLC/m3
cd m3
docker-compose up -d
```

# Understanding M3
<b>M3</b> has a simple ideology. Every file you create is an object. There is only one entity in the system, this is an <i>Object</i>. The purpose of the object is to process the data and return the result (or return Unit). One object can borrow information from another, this behavior is called dependency. An object can also be called according to a schedule, perform an operation on data, but return the result to nothing. M3 will understand the markup of your objects based on Runtime. All of your object lifecycle descriptions are hooks (just like in React).


# Your first Object

To start, let's create an object called `hello`. This is a simple object that returns a string.

```javascript
// hello.js

await useMeta({
    id: 'hello',
    description: undefined,
    schedule: undefined
})

return useFlow(async function() {
    return 'Hello world'
})
```


# Dependencies
Okay, we can create object. But, how do we create dependency? If you have an object called `hello` and another object called `world`, you can create a dependency like this:

```javascript
// world.js

await useMeta({
    id: 'world'
})

const hello = await useDep('hello')

return useFlow(async function() {
    return hello
})
```


# Schedules
M3 also supports schedules. You code can be executed every certain time. You can also create a schedule like this:

```javascript
// schedule.js

await useMeta({
    id: 'schedule',
    schedule: [
        "* * * * *", // every minute
        "* */15 * * *", // every 15 minutes
    ]
})
```

Object `schedule` will execute every minute and every 15 minutes.


# Auto Object Map
M3 creates an object map automatically based on your Runtime. This means that you should make the first call after creating an object and every time you change `useMeta`. In `debug` mode, your `useFlow` and `useDep` will be ignored. Let's create three simple objects called `a`, `b`, and `c`, and merge them into an `abc` object. Call the abc function and see the interactive graph.

```javascript
// a.js, b.js, and c.js

await useMeta({
    id: "a", // different in each
})

return useFlow(() => {
    return Math.random()
})
```

<img src="https://res.cloudinary.com/wireforce/image/upload/v1722814967/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA_%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0_2024-08-05_%D0%B2_2.42.15_AM_cjcjgd.png"/>

M3 understands the object map automatically. And understand return types. Also if you will use Object or Array instance.