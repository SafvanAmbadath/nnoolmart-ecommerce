
function productsPagination(model) {
  return async (req, res, next) => {
  if(req.query.sort=="ascending"){
console.log("ascending")

console.log(req.query)
const page = parseInt(req.query.page)
const limit = parseInt(req.query.limit)

const startIndex = (page - 1) * limit
const endIndex = page * limit

const results = {}
results.current={page,limit}
results.sort="ascending"
if (endIndex < await model.find({}).count()) {
  results.next = {
    page: page + 1,
    limit: limit,
    
  }
}

if (startIndex > 0) {
  results.previous = {
    page: page - 1,
    limit: limit
  }
}
try {
  results.results = await model.find({}).sort({discountPrice:1}).limit(limit).skip(startIndex).exec()
  res.productsPagination = results
  next()
} catch (e) {
  res.status(500).json({ message: e.message })
}

  }else if(req.query.sort=="descending"){

    console.log("descending")

    console.log(req.query)
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    
    const results = {}
    results.current={page,limit}
    results.sort="descending"
    if (endIndex < await model.find({}).count()) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.results = await model.find({}).sort({discountPrice:-1}).limit(limit).skip(startIndex).exec()
      res.productsPagination = results
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
    }


  }else{
   
      console.log(req.query)
      const page = parseInt(req.query.page)
      const limit = parseInt(req.query.limit)
  
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
  
      const results = {}
     results.current={page,limit}
      if (endIndex < await model.find({}).count()) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
      try {
        results.results = await model.find({}).limit(limit).skip(startIndex).exec()
        res.productsPagination = results
        next()
      } catch (e) {
        res.status(500).json({ message: e.message })
      }
    }
  }
  
  }
  module.exports={productsPagination}